'use strict'
const path = require('path')
const fs = require('fs-extra')
const Controller = require('egg').Controller
const token = fs.readJsonSync(path.resolve(__dirname, './../../storage/share_token.json'))
class TestController extends Controller {
  async index() {
    const {ctx, app} = this
    try {
      // await app.model.authenticate()
      // const username = 'admin'
      // const password = ctx.helper.hash('123456')
      // const user = await app.model.User.create({
      //   username,
      //   password,
      //   status: 1,
      //   is_admin: 1,
      // })
      // user.save()
      //   const setting = await app.model.Setting.create({
      //     name: 'app',
      //     value: 'olaindex',
      //   })
      //   setting.save()
      const [setting] = await app.model.Setting.findOrCreate({
        where: {name: 'SHARE_TOKEN'},
        defaults: {
          name: 'SHARE_TOKEN',
          value: token,
        },
      })

      ctx.body = ctx.helper.response(setting.toJSON())
    } catch (error) {
      ctx.logger.error(error)
      ctx.body = ctx.helper.renderError(error.code)
    }
  }
}

module.exports = TestController
