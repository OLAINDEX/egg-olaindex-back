'use strict'

const Controller = require('egg').Controller
class ShareController extends Controller {
  async index() {
    const {ctx, service} = this
    const {id, path, preview, password, params} = ctx.request.body
    const data = await service.data.fetch(id, {
      path,
      preview,
      params,
      password,
    })
    ctx.body = service.response.success(data)
    return
  }

  async test() {
    //   const {ctx, service} = this
    //   let {path} = ctx.query
    //   let {accessToken, api_url, share_folder} = await service.share.getAccessToken(token)
    //   share_folder += '/'
    //   path = ctx.helper.trim(path, '/')
    //   if (!path) {
    //     path = ''
    //     share_folder = ctx.helper.trim(share_folder, '/')
    //   }
    //   try {
    //     const client = service.graph.initAuthenticatedClient(accessToken, api_url, '')
    //     const url = `/root:/${share_folder}${path}:/children`
    //     const data = await client.api(url).get()
    //     ctx.body = service.response.success(data)
    //   } catch (error) {
    //     ctx.body = ctx.helper.renderError(error.code)
    //   }
  }
}
module.exports = ShareController
