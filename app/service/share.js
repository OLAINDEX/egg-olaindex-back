'use strict'

const Service = require('egg').Service

class ShareService extends Service {
  async parseShareUrlParams(shareUrl) {
    const shareUrlReg = /https:\/\/([^/]*)\/:f:\/g\/personal\/([^/]*)/.exec(shareUrl)
    if (!shareUrlReg[1] || !shareUrlReg[2]) {
      throw new Error('shareurl is invalid')
    }
    return {
      tenant: shareUrlReg[1],
      account: shareUrlReg[2],
      cookie: await this.getCookie(shareUrl),
    }
  }

  async getCookie(shareUrl) {
    const {ctx} = this
    const data = await ctx.curl(shareUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
        Cookie: '',
      },
    })
    const headers = data.headers
    if (!headers['set-cookie']) {
      throw new Error('This sharing link has been canceled')
    }
    this.logger.info('sharepoint cookie:' + headers['set-cookie'][0])
    return headers['set-cookie'][0]
  }

  async getAccessToken(token) {
    const {ctx} = this
    const {tenant, account, cookie} = token
    const url = `https://${tenant}/personal/${account}/_api/web/GetListUsingPath(DecodedUrl=@a1)/RenderListDataAsStream?@a1='/personal/${account}/Documents'&RootFolder=/personal/${account}/Documents/&TryNewExperienceSingle=TRUE`
    const res = await ctx.curl(url, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      headers: {
        Accept: 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
        Cookie: cookie,
      },
      data: {
        parameters: {
          __metadata: {type: 'SP.RenderListDataParameters'},
          RenderOptions: 1513223,
          AllowMultipleValueFilterForTaxonomyFields: true,
          AddRequiredFields: true,
        },
      },
      timeout: 5000,
    })
    const accessToken = res.data.ListSchema['.driveAccessToken'].slice(13) // access_token=
    const api_url = res.data.ListSchema['.driveUrl'] + '/'
    const api_url_21 = res.data.ListSchema['.driveUrlV21'] + '/'
    const share_folder = res.data.ListData.Row[0].FileRef.split('/').pop()
    this.logger.info('sharepoint accessToken:' + accessToken)
    return {accessToken, api_url, api_url_21, share_folder}
  }

  async list(path, token, params) {
    const {ctx} = this
    const {account, tenant, cookie} = token
    let url = `https://${tenant}/personal/${account}/_api/web/GetListUsingPath(DecodedUrl=@a1)/RenderListDataAsStream?@a1='/personal/${account}/Documents'&RootFolder=/personal/${account}/Documents/${path}&TryNewExperienceSingle=TRUE`
    if (!ctx.helper.isEmpty(params)) {
      for (const [key, value] of Object.entries(params)) {
        url = ctx.helper.updateQueryStringParameter(url, key, value)
      }
    }
    ctx.logger.info(url)
    const res = await ctx.curl(url, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      headers: {
        Accept: 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
        Cookie: cookie,
      },
      data: {
        parameters: {
          ViewXml:
            // eslint-disable-next-line no-multi-str
            '<View ><Query><OrderBy><FieldRef Name="LinkFilename" Ascending="true"></FieldRef></OrderBy></Query><ViewFields>\
                <FieldRef Name="CurrentFolderSpItemUrl"/>\
                <FieldRef Name="FileLeafRef"/>\
                <FieldRef Name="FSObjType"/>\
                <FieldRef Name="SMLastModifiedDate"/>\
                <FieldRef Name="SMTotalFileStreamSize"/>\
                <FieldRef Name="SMTotalFileCount"/>\
                </ViewFields><RowLimit Paged="TRUE">20</RowLimit></View>',
          __metadata: {type: 'SP.RenderListDataParameters'},
          RenderOptions: 1513223,
          AllowMultipleValueFilterForTaxonomyFields: true,
          AddRequiredFields: true,
        },
      },
      timeout: 5000,
    })
    return res.data
  }

  async item(itemUrl, token) {
    const {ctx} = this
    const {cookie} = token
    const res = await ctx.curl(itemUrl, {
      dataType: 'json',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0',
        Cookie: cookie,
      },
      timeout: 5000,
    })
    return res.data
  }
}

module.exports = ShareService
