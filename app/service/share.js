'use strict';

const Service = require('egg').Service;

class ShareService extends Service {
  async parseShareParams(shareUrl) {
    const shareUrlReg = /https:\/\/([^/]*)\/:f:\/g\/personal\/([^/]*)/.exec(shareUrl);
    if (!shareUrlReg[1] || !shareUrlReg[2]) throw new Error('shareurl is invalid');
    return {
      origin: shareUrlReg[1],
      account: shareUrlReg[2],
    };
  }

  async getCookie(shareUrl) {
    const { ctx } = this;
    const opts = {
      maxRedirects: 0,
      validateStatus(status) {
        return status >= 200 && status < 400;
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
        Cookie: '',
      },
    };
    const headers = (await ctx.helper.request.get(shareUrl, opts)).headers;
    if (!headers['set-cookie']) throw new Error('This sharing link has been canceled');
    ctx.logger.info('sharepoint cookie:' + headers['set-cookie'][0]);
    return headers['set-cookie'][0];
  }

  async list(path, shareUrl) {
    const { ctx } = this;
    const cookie = await this.getCookie(shareUrl);
    const { account, origin } = await this.parseShareParams(shareUrl);
    const url = `https://${origin}/personal/${account}/_api/web/GetListUsingPath(DecodedUrl=@a1)/RenderListDataAsStream`;
    const opts = {
      params: {
        '@a1': `'/personal/${account}/Documents'`,
        RootFolder: `/personal/${account}/Documents${path}`,
        TryNewExperienceSingle: 'TRUE',
      },
      headers: {
        accept: 'application/json;odata=verbose',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN',
        'cache-control': 'no-cache',
        'content-type': 'application/json;odata=verbose',
        origin: 'https://' + origin,
        pragma: 'no-cache',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-serviceworker-strategy': 'CacheFirst',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
        Cookie: cookie,
      },
    };
    const data = {
      parameters: {
        // eslint-disable-next-line no-multi-str
        ViewXml: '<View ><Query><OrderBy><FieldRef Name="LinkFilename" Ascending="true"></FieldRef></OrderBy></Query><ViewFields>\
  <FieldRef Name="CurrentFolderSpItemUrl"/>\
  <FieldRef Name="FileLeafRef"/>\
  <FieldRef Name="FSObjType"/>\
  <FieldRef Name="SMLastModifiedDate"/>\
  <FieldRef Name="SMTotalFileStreamSize"/>\
  <FieldRef Name="SMTotalFileCount"/>\
  </ViewFields><RowLimit Paged="TRUE">200</RowLimit></View>',
        __metadata: { type: 'SP.RenderListDataParameters' },
        RenderOptions: 136967,
        AllowMultipleValueFilterForTaxonomyFields: true,
        AddRequiredFields: true,
      },
    };
    const res = (await ctx.helper.request.post(url, data, opts));
    return res.data;
  }

  async item(itemUrl, shareUrl) {
    const { ctx } = this;
    const cookie = await this.getCookie(shareUrl);
    const opts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0',
        Cookie: cookie,
      },
    };
    const res = await ctx.helper.request.get(itemUrl, opts);
    return res.data;
  }
}

module.exports = ShareService;
