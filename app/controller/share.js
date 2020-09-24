'use strict'

const path = require('path')
const fs = require('fs-extra')
const dayjs = require('dayjs')
const Controller = require('egg').Controller
const token = fs.readJsonSync(path.resolve(__dirname, './../../storage/share_token.json'))
const marked = require('marked')
const {map, filter} = require('lodash')
class ShareController extends Controller {
  async index() {
    const {ctx, service, app} = this
    let {path, preview, params} = ctx.request.body
    path = token.share_folder + '/' + ctx.helper.trim(ctx.helper.defaultValue(path, '/'), '/')
    // const paramsKey = ctx.helper.hash(params)
    // const data = await app.cache.get(
    //   ctx.helper.hash(`share:list:${path}:${paramsKey}`),
    //   async () => {
    //     return await service.share.list(path, token, params)
    //   },
    //   300,
    // )
    const data = await service.share.list(path, token, params)
    if (data.error) {
      if (preview) {
        ctx.body = ''
      } else {
        ctx.body = service.response.success()
      }
    } else {
      if (data.ListData.Row.length > 0) {
        // 文件夹
        const rows = map(data.ListData.Row, (e) => {
          return {
            type: Number(e.FSObjType),
            name: e.LinkFilename,
            size: ctx.helper.formatSize(Number(e.SMTotalFileStreamSize)),
            mime: Number(e.FSObjType) ? '' : ctx.helper.getMime(e.LinkFilename),
            time: dayjs(e.SMLastModifiedDate).format('YYYY-MM-DD HH:mm:ss'),
          }
        })
        const list = filter(rows, (row) => {
          return !ctx.helper.in_array(row.name, ['README.md', 'HEAD.md', '.password'], false)
        })
        const info = await app.cache.get(
          ctx.helper.hash(`share:item:${path}`),
          async () => {
            return await service.share.item(data.ListData.CurrentFolderSpItemUrl, token)
          },
          300,
        )
        if (info.file) ctx.body = service.response.success()
        const item = {
          type: 1,
          name: info.name,
          size: ctx.helper.formatSize(Number(info.size)),
          time: dayjs(info.lastModifiedDateTime).format('YYYY-MM-DD HH:mm:ss'),
          childCount: info.folder.childCount,
        }

        const nextPageParams = ctx.helper.getQueryVariable(data.ListData.NextHref)
        const meta = {
          FirstRow: data.ListData.FirstRow,
          LastRow: data.ListData.LastRow,
          RowLimit: data.ListData.RowLimit,
          nextPageParams,
        }
        ctx.body = service.response.success({list, item, meta})
      } else {
        const info = await app.cache.get(
          ctx.helper.hash(`share:item:${path}`),
          async () => {
            return await service.share.item(data.ListData.CurrentFolderSpItemUrl, token)
          },
          300,
        )
        if (!info.file) ctx.body = service.response.success() // 空文件夹
        if (preview) {
          const content = await app.cache.get(
            ctx.helper.hash(`share:content:${path}`),
            async () => {
              return await ctx.curl(info['@content.downloadUrl'], {
                dataType: 'text',
              })
            },
            300,
          )
          ctx.body = ctx.helper.getMime(info.name) === 'text/markdown' ? marked(content.data) : content.data
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
      const data = await client.api(url).get()
      ctx.body = service.response.success(data)
    } catch (error) {
      ctx.logger.error(error)
      ctx.body = ctx.helper.renderError(error.code)
    }
  }
}
module.exports = ShareController
