'use strict'

const Controller = require('egg').Controller
const {map} = require('lodash')

class BlockController extends Controller {
  async list() {
    const {ctx, service} = this
    const accounts = await service.account.list()
    const settings = await service.setting.fetchAll()
    const rows = map(accounts, (item) => {
      return {
        id: item.id,
        remark: item.remark,
        isMain: item.id === parseInt(settings.main),
      }
    })
    ctx.body = service.response.success(rows)
  }
}

module.exports = BlockController
