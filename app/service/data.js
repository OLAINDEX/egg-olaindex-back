'use strict'

const Service = require('egg').Service
const marked = require('marked')
const {map, filter} = require('lodash')
const dayjs = require('dayjs')
const extension = {
  image: ['ico', 'bmp', 'gif', 'jpg', 'jpeg', 'jpe', 'jfif', 'tif', 'tiff', 'png', 'heic', 'webp'],
  audio: ['mp3', 'wma', 'flac', 'ape', 'wav', 'ogg', 'm4a'],
  office: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  txt: ['txt', 'bat', 'sh', 'php', 'asp', 'js', 'css', 'json', 'html', 'c', 'cpp', 'md', 'py', 'omf'],
  video: ['mp4', 'webm', 'mkv', 'mov', 'flv', 'blv', 'avi', 'wmv', 'm3u8', 'rm', 'rmvb'],
  zip: ['zip', 'rar', '7z', 'gz', 'tar'],
}
class DataService extends Service {
  // async fetchCommon(query) {
  //   const resp = {
  //     item: [],
  //     list: [],
  //     content: '',
  //     meta: [],
  //   }
  //   const {app, ctx, service} = this
  //   const {account_id, path, preview, params} = query
  //   const account = await app.model.Account.findOne({where: {id: account_id}})
  //   const accessToken = await service.account.getAccessToken(account)
  //   const items = await service.graph.getItemsByPath(accessToken, params)
  //   return resp
  // }
  async fetchShare(query) {
    const resp = {
      item: [],
      list: [],
      content: '',
      meta: [],
    }
    const {app, ctx, service} = this
    let {account_id, path, preview, params} = query
    const account = await app.model.Account.findOne({where: {id: account_id}})
    const token = account.raw
    path = token.share_folder + '/' + ctx.helper.trim(ctx.helper.defaultValue(path, '/'), '/')
    params = ctx.helper.defaultValue(params, {PageFirstRow: 1})
    const data = await app.cache.get(
      ctx.helper.hash(`share:list:${path}:${params.PageFirstRow}`),
      async () => {
        return await service.share.list(path, token, params)
      },
      300,
    )
    if (data.error) {
      if (preview) {
        return resp
      }
      return resp
    }
    if (data.ListData.Row.length > 0) {
      // 文件夹
      const rows = map(data.ListData.Row, (e) => {
        return {
          type: Number(e.FSObjType),
          name: e.LinkFilename,
          size: ctx.helper.formatSize(Number(e.SMTotalFileStreamSize)),
          mime: Number(e.FSObjType) ? '' : ctx.helper.getMime(e.LinkFilename),
          time: dayjs(e.SMLastModifiedDate).format('YYYY-MM-DD HH:mm:ss'),
          ext: e['.fileType'],
        }
      })
      resp.list = filter(rows, (row) => {
        return !ctx.helper.in_array(row.name, ['README.md', 'HEAD.md', '.password'], false)
      })
      const info = await app.cache.get(
        ctx.helper.hash(`share:item:${path}`),
        async () => {
          return await service.share.item(data.ListData.CurrentFolderSpItemUrl, token)
        },
        300,
      )
      if (info.file) {
        return resp
      }
      resp.item = {
        type: 1,
        name: info.name,
        size: ctx.helper.formatSize(Number(info.size)),
        time: dayjs(info.lastModifiedDateTime).format('YYYY-MM-DD HH:mm:ss'),
        childCount: info.folder.childCount,
      }

      const nextPageParams = ctx.helper.getQueryVariable(data.ListData.NextHref)
      resp.meta = {
        FirstRow: data.ListData.FirstRow,
        LastRow: data.ListData.LastRow,
        RowLimit: data.ListData.RowLimit,
        nextPageParams,
      }

      return resp
    }
    const info = await app.cache.get(
      ctx.helper.hash(`share:item:${path}`),
      async () => {
        return await service.share.item(data.ListData.CurrentFolderSpItemUrl, token)
      },
      300,
    )
    if (!info.file) {
      return resp
    }
    const ext = ctx.helper.getExtensionByName(info.name)
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
      if (ctx.helper.in_array(ext, extension.txt)) {
        const rawContent = ctx.helper.getMime(info.name) === 'text/markdown' ? marked(content.data) : content.data
        resp.content = rawContent
        return resp
      }
      ctx.redirect(info['@content.downloadUrl'])
    } else {
      let thumb = {}
      if (!ctx.helper.isEmpty(info.thumbnails)) {
        thumb = {
          small: info.thumbnails[0].small,
          medium: info.thumbnails[0].medium,
          large: info.thumbnails[0].large,
        }
      }
      resp.item = {
        type: 0,
        name: info.name,
        size: ctx.helper.formatSize(Number(info.size)),
        mime: info.file.mimeType,
        time: dayjs(info.lastModifiedDateTime).format('YYYY-MM-DD HH:mm:ss'),
        ext,
        url: info['@content.downloadUrl'],
        thumb,
      }
      return resp
    }
  }
}

module.exports = DataService
