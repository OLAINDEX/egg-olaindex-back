'use strict';

const path = require('path');
const fse = require('fs-extra');
const Controller = require('egg').Controller;
const token = fse.readJsonSync(
  path.resolve(__dirname, './../../storage/access_token.json')
);
const share = fse.readJsonSync(
  path.resolve(__dirname, './../../storage/share_point.json')
);
class HomeController extends Controller {
  async index() {
    const { ctx, service } = this;
    try {
      const accessToken = await service.token.getAccessToken(token);
      const user = await service.graph.getUserDetails(accessToken);
      let username = '';
      if (user) {
        username = user.displayName ? user.displayName : user.userPrincipalName;
      }
      ctx.body = `hello, ${username}`;
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = ctx.helper.renderError(error.code);
    }
  }

  async test() {
    const { ctx, service } = this;
    const shareUrl = share.shareUrl;
    const data = await service.share.getAccessToken(shareUrl);
    ctx.body = data;
  }

  async share() {
    const { ctx, service } = this;
    const { path } = ctx.query;
    const shareUrl = share.shareUrl;
    const data = await service.share.list(path, shareUrl);
    const offset =
      (new Date().getTimezoneOffset() - data.RegionalSettingsTimeZoneBias ||
        0) * 60000;
    if (data.ListData.Row.length > 0) {
      // 文件夹
      const list = [];
      data.ListData.Row.forEach(e => {
        list.push({
          type: Number(e.FSObjType),
          name: e.LinkFilename,
          size: Number(e.SMTotalFileStreamSize),
          mime: Number(e.FSObjType) ? '' : ctx.helper.getMime(e.LinkFilename),
          time: new Date(new Date(e.SMLastModifiedDate) - offset).toISOString(),
        });
      });
      ctx.body = ctx.helper.Response.list(list);
    } // 文件 或 空文件夹
    const info = await service.share.item(
      data.ListData.CurrentFolderSpItemUrl,
      shareUrl
    );
    if (!info.file) return ctx.helper.Response.list([]); // 空文件夹
    ctx.body = ctx.helper.Response.file(
      {
        type: 0,
        name: info.name,
        size: info.size,
        mime: info.file.mimeType,
        time: new Date(
          new Date(info.lastModifiedDateTime) - offset
        ).toISOString(),
      },
      info['@content.downloadUrl']
    );
  }
}

module.exports = HomeController;
