'use strict'

const Controller = require('egg').Controller
const {AuthorizationCode} = require('simple-oauth2')

class AuthController extends Controller {
  async callback() {
    const {app, service, ctx} = this
    const {code, state} = ctx.query
    if (!state) {
      ctx.body = ctx.helper.renderError('Invaild state')
      return
    }
    const cache = await app.cache.get(state)
    const tokenConfig = {
      code,
      redirect_uri: cache.redirect_uri,
      scope: app.config.scope.split(' '),
    }
    let auth = app.config.com_api
    const TYPE_CN = 1
    if (cache.type === TYPE_CN) {
      auth = app.config.cn_api
      tokenConfig.resource = app.config.rest_endpoint_cn
    }
    try {
      const client = new AuthorizationCode({
        client: {
          id: cache.client_id,
          secret: cache.client_secret,
        },
        auth: {
          tokenHost: auth.tokenHost,
          authorizePath: auth.authorizePath,
          tokenPath: auth.tokenPath,
        },
      })
      const accessToken = await client.getToken(tokenConfig)
      let token = accessToken.token
      if (cache.type === TYPE_CN) {
        token = Object.assign({}, token, {type: TYPE_CN})
      }
      await service.account.create({
        remark: cache.remark,
        type: cache.type,
        client_id: cache.client_id,
        client_secret: cache.client_secret,
        redirect_uri: cache.redirect_uri,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_on: token.expires_on,
        raw: token,
      })
    } catch (error) {
      ctx.logger.error('Access Token Error', error.message)
      ctx.body = ctx.helper.renderError(error.message)
      return
    }
    ctx.redirect(cache.origin_uri)
  }
}

module.exports = AuthController
