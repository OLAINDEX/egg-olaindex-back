'use strict'

const path = require('path')
const fs = require('fs-extra')
const dayjs = require('dayjs')
const Controller = require('egg').Controller
const token = fs.readJsonSync(path.resolve(__dirname, './../../storage/share_token.json'))
const marked = require('marked')
class ShareController extends Controller {
  async index() {
    const {ctx, service, app} = this
    let {path, preview} = ctx.query
    path = token.share_folder + '/' + ctx.helper.trim(path, '/')
    const data = await app.cache.get(
      `share:list:${path}`,
      async () => {
        return await service.share.list(path, token)
      },
      60,
    )
    if (data.error) {
      if (preview) {
        ctx.body = ''
      } else {
        ctx.body = service.response.success()
      }
    } else {
      if (data.ListData.Row.length > 0) {
        // 文件夹
        const list = []
        data.ListData.Row.forEach((e) => {
          list.push({
            type: Number(e.FSObjType),
            name: e.LinkFilename,
            size: ctx.helper.formatSize(Number(e.SMTotalFileStreamSize)),
            mime: Number(e.FSObjType) ? '' : ctx.helper.getMime(e.LinkFilename),
            time: dayjs(e.SMLastModifiedDate).format('YYYY-MM-DD HH:mm:ss'),
          })
        })
        const info = await app.cache.get(
          `share:item:${path}`,
          async () => {
            return await service.share.item(data.ListData.CurrentFolderSpItemUrl, token)
          },
          60,
        )
        if (info.file) ctx.body = service.response.success()
        const item = {
          type: 1,
          name: info.name,
          size: ctx.helper.formatSize(Number(info.size)),
          time: dayjs(info.lastModifiedDateTime).format('YYYY-MM-DD HH:mm:ss'),
          childCount: info.folder.childCount,
        }
        ctx.body = service.response.success({list, item})
      } else {
        const info = await app.cache.get(
          `share:item:${path}`,
          async () => {
            return await service.share.item(data.ListData.CurrentFolderSpItemUrl, token)
          },
          60,
        )
        if (!info.file) ctx.body = service.response.success() // 空文件夹
        if (preview) {
          const content = await app.cache.get(
            `share:content:${path}`,
            async () => {
              return await ctx.curl(info['@content.downloadUrl'], {
                dataType: 'text',
              })
            },
            60,
          )
          ctx.body = marked(content.data)
        } else {
          ctx.body = service.response.success({
            type: 0,
            name: info.name,
            size: ctx.helper.formatSize(Number(info.size)),
            mime: info.file.mimeType,
            time: dayjs(info.lastModifiedDateTime).format('YYYY-MM-DD HH:mm:ss'),
            url: info['@content.downloadUrl'],
          })
        }
      }
    }
  }

  async test() {
    const {ctx, service} = this
    let {path} = ctx.query
    let {accessToken, api_url, share_folder} = await service.share.getAccessToken(token)

    share_folder += '/'
    path = ctx.helper.trim(path, '/')
    if (!path) {
      path = ''
      share_folder = ctx.helper.trim(share_folder, '/')
    }
    try {
      const client = service.graph.initAuthenticatedClient(accessToken, api_url, '')
      const url = `/root:/${share_folder}${path}:/children`
      ctx.logger.info(url)
      const data = await client.api(url).get()
      ctx.body = service.response.success(data)
    } catch (error) {
      ctx.logger.error(error)
      ctx.body = ctx.helper.renderError(error.code)
    }
  }
}
module.exports = ShareController
