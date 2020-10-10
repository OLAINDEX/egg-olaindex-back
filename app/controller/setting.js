'use strict'

const Controller = require('egg').Controller
class SettingController extends Controller {
  async index() {
    const {ctx, service} = this
    const data = await service.setting.fetchAll()
    ctx.body = service.response.success(data)
  }

  async update() {
    const {ctx, service} = this
    const data = ctx.request.body.config
    await service.setting.batchUpdate(data)
    ctx.body = service.response.success(data)
  }
}

module.exports = SettingController
