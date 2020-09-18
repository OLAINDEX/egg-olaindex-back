'use strict'

const path = require('path')
const fs = require('fs-extra')
const {omit} = require('lodash')
const {AuthorizationCode} = require('simple-oauth2')
const Service = require('egg').Service

class TokenService extends Service {
  async getAccessToken(tokenObj) {
    const {app} = this
    const tokenConfig = {
      redirect_uri: app.config.userConfig.redirect_uri,
      scope: app.config.userConfig.scope.split(' '),
    }
    const type = tokenObj.type
    let baseUrl = app.config.userConfig.rest_endpoint
    let config = app.config.oauth2
    if (type === 'cn') {
      config = app.config.oauth2_cn
      tokenConfig.resource = app.config.userConfig.rest_enpoint_cn
      baseUrl = app.config.userConfig.rest_endpoint_cn
    }
    tokenObj = omit(tokenObj, ['type'])
    const client = new AuthorizationCode(config)
    const EXPIRATION_WINDOW_IN_SECONDS = 300
    let accessToken = client.createToken(tokenObj)
    if (accessToken.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
      try {
        accessToken = await accessToken.refresh(tokenConfig)
        this.logger.info('Refreshing access token success')
        let token = accessToken.token
        if (type === 'cn') {
          token = Object.assign({}, token, {type: 'cn'})
        }
        fs.writeJsonSync(path.resolve(__dirname, './../../storage/access_token.json'), token)
        return {accessToken: token.access_token, baseUrl}
      } catch (error) {
        this.logger.error('Error refreshing access token: ', error.message)
        return {}
      }
    }
    return {accessToken: accessToken.token.access_token, baseUrl}
  }
}
module.exports = TokenService
