'use strict';

const Service = require('egg').Service;

class ShareService extends Service {
  async parseShareUrlParams(shareUrl) {
    const shareUrlReg = /https:\/\/([^/]*)\/:f:\/g\/personal\/([^/]*)/.exec(
      shareUrl
    );
    if (!shareUrlReg[1] || !shareUrlReg[2]) {
      throw new Error('shareurl is invalid');
    }
    const { ctx } = this;
    const opts = {
      maxRedirects: 0,
      validateStatus(status) {
        return status >= 200 && status < 400;
      },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
        Cookie: '',
      },
    };
    const headers = (await ctx.helper.request.get(shareUrl, opts)).headers;
    if (!headers['set-cookie']) {
      throw new Error('This sharing link has been canceled');
    }
    this.logger.info('sharepoint cookie:' + headers['set-cookie'][0]);

    return {
      origin: shareUrlReg[1],
      account: shareUrlReg[2],
      cookie: this.getCookie(shareUrl),
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
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
        Cookie: '',
      },
    };
    const headers = (await ctx.helper.request.get(shareUrl, opts)).headers;
    if (!headers['set-cookie']) {
      throw new Error('This sharing link has been canceled');
    }
    this.logger.info('sharepoint cookie:' + headers['set-cookie'][0]);
    return headers['set-cookie'][0];
  }

  async getAccessToken(shareUrl) {
    const { ctx } = this;
    const { account, origin, cookie } = await this.parseShareUrlParams(
      shareUrl
    );
    const url = `https://${origin}/personal/${account}/_api/web/GetListUsingPath(DecodedUrl=@a1)/RenderListDataAsStream`;
    const opts = {
      params: {
        '@a1': `'/personal/${account}/Documents'`,
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
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
        cookie,
      },
    };
    const data = {
      parameters: {
        __metadata: { type: 'SP.RenderListDataParameters' },
        RenderOptions: 1513223,
        AllowMultipleValueFilterForTaxonomyFields: true,
        AddRequiredFields: true,
      },
    };
    const res = await ctx.helper.request.post(url, data, opts);
    const accessToken = res.ListSchema['.driveAccessToken'].slice(13); // access_token=
    const api_url = res.ListSchema['.driveUrl'] + '/';
    return { accessToken, api_url };
  }

  async list(path, shareUrl) {
    const { ctx } = this;
    const { account, origin, cookie } = await this.parseShareUrlParams(
      shareUrl
    );
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
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-serviceworker-strategy': 'CacheFirst',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
        cookie,
      },
    };
    const data = {
      parameters: {
        __metadata: { type: 'SP.RenderListDataParameters' },
        RenderOptions: 1513223,
        AllowMultipleValueFilterForTaxonomyFields: true,
        AddRequiredFields: true,
      },
    };
    const res = await ctx.helper.request.post(url, data, opts);
    return res.data;
  }

  async item(itemUrl, shareUrl) {
    const { ctx } = this;
    const { cookie } = await this.parseShareUrlParams(shareUrl);
    const opts = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0',
        Cookie: cookie,
      },
    };
    const res = await ctx.helper.request.get(itemUrl, opts);
    return res.data;
  }
}

module.exports = ShareService;
