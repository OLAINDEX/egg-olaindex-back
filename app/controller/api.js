'use strict'

const path = require('path')
const fs = require('fs-extra')
const Controller = require('egg').Controller
const token = fs.readJsonSync(path.resolve(__dirname, './../../storage/access_token.json'))

class ApiController extends Controller {
  async getMe() {
    const {ctx, service} = this
    try {
      const accessToken = await service.token.getAccessToken(token)
      const user = await service.graph.getUserDetails(accessToken)
      ctx.body = user
    } catch (error) {
      ctx.logger.error(error)
      ctx.body = ctx.helper.renderError(error.code)
    }
  }

  async getDrive() {
    const {ctx, service} = this
    try {
      const accessToken = await service.token.getAccessToken(token)
      const drive = await service.graph.getUserDrive(accessToken)
      ctx.body = drive
    } catch (error) {
      ctx.logger.error(error)
      ctx.body = ctx.helper.renderError(error.code)
    }
  }

  async getItems() {
    const {ctx, service} = this
    try {
      const {itemId, skip, top, expand} = ctx.query
      const params = {itemId, skip, top, expand}
      const accessToken = await service.token.getAccessToken(token)
      const items = await service.graph.getItems(accessToken, params)
      ctx.body = items
    } catch (error) {
      ctx.logger.error(error)
      ctx.body = ctx.helper.renderError(error.code)
    }
  }

  async getItem() {
    const {ctx, service} = this
    try {
      const {itemId, expand} = ctx.query
      const params = {itemId, expand}
      const accessToken = await service.token.getAccessToken(token)
      const item = await service.graph.getItem(accessToken, params)
      ctx.body = item
    } catch (error) {
      ctx.logger.error(error)
      ctx.body = ctx.helper.renderError(error.code)
    }
  }
}

module.exports = ApiController
