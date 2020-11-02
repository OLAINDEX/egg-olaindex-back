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
          token: accessToken,
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
  async profile() {
    const {ctx, app, service} = this
    const {id} = ctx.request.query
    const user = await app.model.User.findByPk(id)
    if (!user) {
      ctx.body = service.response.fail('用户不存在')
      return
    }
    ctx.body = service.response.success(user.toJSON())
  }

  async update() {
    const {ctx, app, service} = this
    const {id} = ctx.request.query
    const {data} = ctx.request.body
    const user = await app.model.User.findByPk(id)
    if (!user) {
      ctx.body = service.response.fail('用户不存在')
      return
    }
    user.update(data)
    ctx.body = service.response.success(user.toJSON())
  }
}

module.exports = UserController
