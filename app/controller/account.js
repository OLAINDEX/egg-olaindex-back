'use strict'

const Controller = require('egg').Controller

class AccountController extends Controller {
  index() {}
  async create() {
    const {ctx, service} = this
    const TYPE_SHARE = 0
    const TYPE_CN = 1
    const TYPE_COM = 2
    const params = ctx.request.body
    if (params.type === TYPE_SHARE) {
      const data = await service.share.parseShareUrlParams(params.share_uri)
      const token = await service.share.getAccessToken(data)
      // service.account.create(params)
    } else {
      // service.account.create(params)
    }
  }
}

module.exports = AccountController
