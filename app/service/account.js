'use strict'

const Service = require('egg').Service
const {omit} = require('lodash')
const {AuthorizationCode} = require('simple-oauth2')

class AccountService extends Service {
  async findOne(options) {
    const {app} = this
    const account = await app.model.Account.findOne(options)
    return account
  }
  async list() {
    const {app} = this
    const accounts = await app.model.Account.findAll()
    return accounts
  }
  async create(data) {
    const {app} = this
    const account = await app.model.Account.create(data)
    return account
  }
  async update(data) {
    const {app} = this
    const account = await app.model.Account.update(data)
    return account
  }

  async delete(id) {
    const {app} = this
    const account = await app.model.Account.findByPk(id)
    account.destroy()
    return true
  }
  async getAccessToken(account) {
    const {app} = this
    // const TYPE_SHARE = 0
    const TYPE_CN = 1
    // const TYPE_COM = 2
    const type = account.type
    let tokenObj = account.raw
    const tokenConfig = {
      redirect_uri: account.redirect_uri,
      scope: app.config.scope.split(' '),
    }
    let baseUrl = app.config.rest_endpoint
    let auth = app.config.com_api
    if (type === TYPE_CN) {
      auth = app.config.cn_api
      tokenConfig.resource = app.config.rest_enpoint_cn
      baseUrl = app.config.rest_endpoint_cn
    }
    tokenObj = omit(tokenObj, ['type'])
    const client = new AuthorizationCode({
      client: {
        id: account.client_id,
        secret: account.client_secret,
      },
      auth: {
        tokenHost: auth.tokenHost,
        authorizePath: auth.authorizePath,
        tokenPath: auth.tokenPath,
      },
    })
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
        await account.update({
          raw: token,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          expires_on: token.expires_on,
        })
        return {accessToken: token.access_token, baseUrl}
      } catch (error) {
        this.logger.error('Error refreshing access token: ', error.message)
        return {}
      }
    }
    return {accessToken: accessToken.token.access_token, baseUrl}
  }
}

module.exports = AccountService
