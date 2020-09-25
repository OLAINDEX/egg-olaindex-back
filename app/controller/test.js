'use strict'

const Controller = require('egg').Controller
class TestController extends Controller {
  async index() {
    const {ctx, app} = this
    try {
      await app.model.authenticate()
      const username = 'admin'
      const password = '123456'
      const user = await app.model.User.create({
        username,
        password,
        status: 1,
        is_admin: 1,
      })
      user.save()
    } catch (error) {
      ctx.logger.error(error)
      ctx.body = ctx.helper.renderError(error.code)
    }
  }

  async page() {
    const ctx = this.ctx
    await ctx.render('test.nj', {name: 'egg'})
  }
}

module.exports = TestController
