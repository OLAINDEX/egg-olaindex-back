'use strict'

const Controller = require('egg').Controller
const {AuthorizationCode} = require('simple-oauth2')
const {map} = require('lodash')

class AccountController extends Controller {
  async fetchConfig() {
    const {app, ctx, service} = this
    const params = ctx.request.query
    const id = params.id
    const account_hash = ctx.helper.hash(id)
    const config = ctx.helper.defaultValue(await app.model.Setting.findOne({where: {name: account_hash}}), {
      name: account_hash,
      value: {},
    }).value
    ctx.body = service.response.success(config)
  }
  async updateConfig() {
    const {ctx, service} = this
    const params = ctx.request.body
    const id = params.id
    const account_hash = ctx.helper.hash(id)
    const post = {}
    post[account_hash] = params
    ctx.logger.info(post)
    const data = await service.setting.batchUpdate(post)
    ctx.body = service.response.success(data)
  }
  async list() {
    const {app, ctx, service} = this
    const accounts = await app.model.Account.findAll()
    const settings = await service.setting.fetchAll()
    const rows = map(accounts, (item) => {
      return {
        isMain: item.id === parseInt(settings.main),
        ...item.toJSON(),
      }
    })
    ctx.body = service.response.success(rows)
  }

  async view() {
    const {app, ctx, service} = this
    const params = ctx.request.query
    const id = params.id
    const account = await app.model.Account.findByPk(id)
    ctx.body = service.response.success(account.toJSON())
  }

  async update() {
    const {app, ctx, service} = this
    const params = ctx.request.body
    const id = params.id
    const account = await app.model.Account.findByPk(id)
    account.update(params)
    ctx.body = service.response.success(account.toJSON())
  }

  async delete() {
    const {app, ctx, service} = this
    const params = ctx.request.body
    const id = params.id
    const account = await app.model.Account.findByPk(id)
    await account.destroy()
    ctx.body = service.response.success()
  }

  async mark() {
    const {ctx, service} = this
    const params = ctx.request.body
    const id = params.id
    await service.setting.batchUpdate({
      main: id,
    })
    ctx.body = service.response.success({main: id})
  }

  async init() {
    const {app, ctx, service} = this
    const TYPE_SHARE = 0
    const TYPE_CN = 1
    // const TYPE_COM = 2
    try {
      ctx.validate({
        remark: {type: 'string', required: true},
      })
    } catch (err) {
      ctx.logger.warn(err.message)
      ctx.body = service.response.fail(':( 请确保填写正确的参数！', 422)
      return
    }

    const params = ctx.request.body
    if (params.type === TYPE_SHARE) {
      const data = await service.share.parseShareUrlParams(params.share_uri)
      const token = await service.share.getAccessToken(data)
      const raw = {...data, ...token}
      const account = await app.model.Account.create({
        type: params.type,
        remark: params.remark,
        access_token: token.accessToken,
        share_uri: params.share_uri,
        raw,
      })
      ctx.body = service.response.success({type: params.type, account: account.toJSON})
      return
    }
    const state = ctx.helper.randomString(20)
    await app.cache.set(state, params, 300)
    let auth = app.config.com_api
    if (params.type === TYPE_CN) {
      auth = app.config.cn_api
    }
    const client = new AuthorizationCode({
      client: {
        id: params.client_id,
        secret: params.client_secret,
      },
      auth: {
        tokenHost: auth.tokenHost,
        authorizePath: auth.authorizePath,
        tokenPath: auth.tokenPath,
      },
    })
    const authorizationUri = client.authorizeURL({
      redirect_uri: params.redirect_uri,
      scope: app.config.scope.split(' '),
      state,
    })

    ctx.body = service.response.success({type: params.type, redirect_uri: authorizationUri})
  }
}

module.exports = AccountController
