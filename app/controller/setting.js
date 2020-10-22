'use strict'

const Controller = require('egg').Controller
const {forEach} = require('lodash')
const allowShow = ['expires', 'img_host', 'img_host_account']

class SettingController extends Controller {
  async index() {
    const {ctx, service} = this
    const list = await service.setting.fetchAll()
    const data = {}
    forEach(list, (row, index) => {
      if (ctx.helper.in_array(index, allowShow, false)) {
        data[index] = row
      }
    })
    ctx.body = service.response.success(data)
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
