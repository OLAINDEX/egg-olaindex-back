'use strict'

const path = require('path')
const fs = require('fs-extra')
const Controller = require('egg').Controller
const token = fs.readJsonSync(path.resolve(__dirname, './../../storage/access_token.json'))
class HomeController extends Controller {
  async index() {
    const {ctx, service} = this
    try {
      const accessToken = await service.token.getAccessToken(token)
      const user = await service.graph.getUserDetails(accessToken)
      let username = ''
      if (user) {
        username = user.displayName ? user.displayName : user.userPrincipalName
      }
      ctx.body = `hello, ${username}`
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

module.exports = HomeController
