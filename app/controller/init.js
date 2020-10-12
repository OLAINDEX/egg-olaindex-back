'use strict'

const path = require('path')
const fs = require('fs-extra')
const Controller = require('egg').Controller
const lockFile = path.resolve(__dirname, './../../storage/install.lock')

class InitController extends Controller {
  async index() {
    const {app, service, ctx} = this
    const isInstall = fs.existsSync(lockFile)
    if (!isInstall) {
      ctx.body = service.response.fail('已初始化应用')
      return
    }
    const username = ctx.request.body.username
    const password = ctx.helper.hash(ctx.request.body.password)
    try {
      const user = await app.model.User.create({
        username,
        password,
        status: 1,
        is_admin: 1,
      })
      user.save()
      ctx.body = service.response.success()
      fs.writeFileSync(lockFile, '')
    } catch (error) {
      ctx.body = service.response.fail(error.message)
    }
  }
  check() {
    const {service, ctx} = this
    ctx.logger.info(lockFile)
    ctx.body = service.response.success({install: fs.existsSync(lockFile)})
  }
  async load() {
    const {ctx, service} = this
    const data = await service.setting.fetchAll()
    ctx.body = service.response.success(data)
  }
}

module.exports = InitController
