'use strict'

const Controller = require('egg').Controller
class UserController extends Controller {
  async login() {
    const {ctx, app, service} = this
    const {username, password} = ctx.request.body
    const user = await app.model.User.findOne({
      where: {username},
    })
    if (user) {
      if (user.password === ctx.helper.hash(password)) {
        const user_id = user.id
        const accessToken = service.jwt.signToken(
          {
            data: {
              user_id,
            },
          },
          {expiresIn: '7 days'},
        )
        ctx.body = service.response.success({
          accessToken,
          username,
          user_id,
          is_admin: user.isAdmin,
          status: user.status,
        })
      } else {
        ctx.body = service.response.fail('用户名或密码错误', 400)
      }
    } else {
      ctx.body = service.response.fail('用户名或密码错误', 400)
    }
  }
}

module.exports = UserController
