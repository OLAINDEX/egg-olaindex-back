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
    const id = ctx.locals.user_id
    const user = await app.model.User.findByPk(id)
    if (!user) {
      ctx.body = service.response.fail('用户不存在', 404)
      return
    }
    const userInfo = {
      id: user.id,
      username: user.username,
    }
    ctx.body = service.response.success(userInfo)
  }

  async update() {
    const {ctx, app, service} = this
    const id = ctx.locals.user_id
    let {username, password} = ctx.request.body
    const errors = app.validator.validate(
      {
        username: {type: 'string', required: true},
        password: {type: 'password', require: true, compare: 'password_confirmation', allowEmpty: false, min: 6},
        password_confirmation: {
          type: 'password',
          require: true,
          allowEmpty: false,
          min: 6,
        },
      },
      ctx.request.body,
    )
    if (errors) {
      const f_err = errors.pop()
      const msg = `${f_err.code}:${f_err.field}  ${f_err.message}`
      ctx.body = service.response.fail(`参数错误 ${msg}`, 422, errors)
      return
    }
    const user = await app.model.User.findByPk(id)
    if (!user) {
      ctx.body = service.response.fail('用户不存在', 404)
      return
    }
    password = ctx.helper.hash(password)
    user.update({username, password})
    ctx.body = service.response.success(user.toJSON())
  }
}

module.exports = UserController
