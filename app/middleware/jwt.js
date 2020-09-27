'use strict'
const jwt = require('jsonwebtoken')
/**
 *
 * @param {Object} options options
 * @param {Egg.Application} app Application
 */
module.exports = (options, app) => {
  return async function handle(ctx, next) {
    if (!ctx.request.header || !ctx.request.header.authorization) {
      ctx.body = ctx.helper.response([], 401, 'Your request was made with invalid credentials.')
      ctx.status = 401
    } else {
      const {secret} = options
      const verifyToken = (token) => {
        let data = {}
        try {
          const payload = jwt.verify(token, secret) || {}
          const {exp} = payload,
            current = Math.floor(Date.now() / 1000)
          if (current <= exp) data = payload || {}
        } catch (e) {
          app.logger.error(e)
        }
        return data
      }
      const accessToken = ctx.request.header.authorization.trim().split(' ')

      if (accessToken.length === 2) {
        const scheme = accessToken[0]
        const credentials = accessToken[1]

        if (/^Bearer$/i.test(scheme)) {
          const res = verifyToken(credentials)
          if (res.data && res.data.user_id) {
            // const user = await app.model.User.findByPk(res.data.user_id)
            // ctx.session.user = user.toJSON()
            // ctx.session.isAuthenticated = true
            await next()
          } else {
            ctx.body = ctx.helper.response([], 401, 'invalid token')
            ctx.status = 401
          }
        }
      }
    }
  }
}
