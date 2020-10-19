'use strict'

const Controller = require('egg').Controller
class TestController extends Controller {
  async index() {
    const {app, ctx, service} = this
    const account = await app.model.Account.findOne({where: {id: 6}})
    const accessToken = await service.account.getAccessToken(account)
    const items = await service.graph.getItemsByPath(accessToken, 'Workplace')
    ctx.body = service.response.success(items)
    return
  }
}

module.exports = TestController
