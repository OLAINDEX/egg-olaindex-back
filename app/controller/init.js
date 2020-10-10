'use strict'

const Controller = require('egg').Controller
class InitController extends Controller {
  async index() {
    const {app, service, ctx} = this
    const username = ctx.request.body.username
    const password = ctx.helper.hash(ctx.request.body.password)
    const user = await app.model.User.create({
      username,
      password,
      status: 1,
      is_admin: 1,
    })
    user.save()

    ctx.body = service.response.success()
  }
}

module.exports = InitController
