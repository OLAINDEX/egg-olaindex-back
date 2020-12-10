'use strict'

const Controller = require('egg').Controller
const {forEach, map} = require('lodash')
const allowShow = ['cache_expires', 'img_host', 'img_host_account', 'img_host_size_limit']

class SettingController extends Controller {
  async index() {
    const {app, ctx, service} = this
    const list = await service.setting.fetchAll()
    const accounts = await app.model.Account.findAll()
    const settings = await service.setting.fetchAll()
    const data = {}
    forEach(list, (row, index) => {
      if (ctx.helper.in_array(index, allowShow, false)) {
        data[index] = row
      }
    })
    const rows = map(accounts, (item) => {
      return {
        id: item.id,
        remark: item.remark,
        isMain: item.id === parseInt(settings.main),
        type: item.type,
      }
    })
    ctx.body = service.response.success({config: data, accounts: rows})
  }

  async update() {
    const {ctx, service} = this
    const data = ctx.request.body.config
    await service.setting.batchUpdate(data)
    const resp = {}
    forEach(data, (row, index) => {
      if (ctx.helper.in_array(index, allowShow, false)) {
        resp[index] = row
      }
    })
    ctx.body = service.response.success(resp)
  }
}

module.exports = SettingController
