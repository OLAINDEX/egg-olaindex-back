'use strict'

const Service = require('egg').Service
const marked = require('marked')
const {map, filter} = require('lodash')
const dayjs = require('dayjs')
const url = require('url')
const extension = {
  image: ['ico', 'bmp', 'gif', 'jpg', 'jpeg', 'jpe', 'jfif', 'tif', 'tiff', 'png', 'heic', 'webp'],
  audio: ['mp3', 'wma', 'flac', 'ape', 'wav', 'ogg', 'm4a'],
  office: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  txt: ['txt', 'bat', 'sh', 'php', 'asp', 'js', 'css', 'json', 'html', 'c', 'cpp', 'md', 'py', 'omf'],
  video: ['mp4', 'webm', 'mkv', 'mov', 'flv', 'blv', 'avi', 'wmv', 'm3u8', 'rm', 'rmvb'],
  zip: ['zip', 'rar', '7z', 'gz', 'tar'],
}
class DataService extends Service {
  async fetch(id, query) {
    const {app, ctx} = this
    const account = await app.model.Account.findByPk(id)
    const type = account.type
    const account_hash = ctx.helper.hash(id)
    const config = ctx.helper.defaultValue(await app.model.Setting.findOne({where: {name: account_hash}}), {
      name: account_hash,
      value: {},
    }).value
    if (type > 0) {
      return await this.fetchCommon(account, query, config)
    }
    return await this.fetchShare(account, query, config)
  }
  async fetchShare(account, query, config) {
    const resp = {
      item: {},
      list: [],
      content: '',
      meta: {},
    }
    const {app, ctx, service} = this
    let {path, preview, password, params} = query
    const token = account.raw
    const root = ctx.helper.trim(ctx.helper.defaultValue(config.root, ''), '/')
    const start = token.share_folder + (root ? '/' + root : '')
    const hide = ctx.helper.defaultValue(config.hide, '').split('|')
    const encrypt = ctx.helper.defaultValue(config.encrypt, '').split('|')
    const querypath = ctx.helper.trim(ctx.helper.defaultValue(path, '/'), '/')
    const encrypt_arr = []
    let pathIsEncrypt = false
    for (const i in encrypt) {
      const encrypt_path = encrypt[i].split(':')[0]
      const pattern = ctx.helper.trim(encrypt_path, '/')
      if (ctx.helper.isEmpty(pattern)) {
        break
      }
      const encrypt_pass = ctx.helper.defaultValue(encrypt[i].split(':')[1], '')
      const regx = new RegExp(`^${pattern}`)
      if (regx.test(ctx.helper.trim(querypath, '/'))) {
        ctx.logger.info(password, encrypt_pass)
        if (encrypt_pass && password === encrypt_pass) {
          break
        }
        pathIsEncrypt = true
        resp.item = {encrypt: true}
        return resp
      }
      encrypt_arr.push(encrypt_path)
    }
    for (const i in hide) {
      const pattern = ctx.helper.trim(hide[i], '/')
      if (ctx.helper.isEmpty(pattern)) {
        break
      }
      const regx = new RegExp(`^${pattern}`)
      if (regx.test(querypath)) {
        return resp
      }
    }

    path = start + '/' + querypath
    params = ctx.helper.defaultValue(params, {PageFirstRow: 1})
    const data = await service.share.list(path, token, params)
    if (data.error) {
      await service.account.refreshCookie(account)
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
        let isHide = false
        for (const i in hide) {
          const pattern = ctx.helper.trim(hide[i], '/')
          if (ctx.helper.isEmpty(pattern)) {
            break
          }
          const regx = new RegExp(`^${pattern}`)
          if (regx.test(ctx.helper.trim(querypath + '/' + row.name, '/'))) {
            isHide = true
            break
          }
        }
        return !isHide && !ctx.helper.in_array(row.name, ['README.md', 'HEAD.md', '.password'], false)
      })
      const info = await service.share.item(data.ListData.CurrentFolderSpItemUrl, token)
      if (info.file) {
        return resp
      }
      resp.item = {
        type: 1,
        name: info.name,
        size: ctx.helper.formatSize(Number(info.size)),
        time: dayjs(info.lastModifiedDateTime).format('YYYY-MM-DD HH:mm:ss'),
        childCount: resp.list.length,
        encrypt: pathIsEncrypt,
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
    const info = await service.share.item(data.ListData.CurrentFolderSpItemUrl, token)
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
      }
      return resp
    }
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
      encrypt: pathIsEncrypt,
    }
    return resp
  }
  async fetchCommon(account, query, config) {
    const resp = {
      item: {},
      list: [],
      content: '',
      meta: {},
    }
    const {ctx, service} = this
    let {path, preview, password, params} = query
    const queryPath = ctx.helper.trim(ctx.helper.defaultValue(path, ''), '/')
    const root = ctx.helper.trim(ctx.helper.defaultValue(config.root, ''), '/')
    const hide = ctx.helper.defaultValue(config.hide, '').split('|')
    const encrypt = ctx.helper.defaultValue(config.encrypt, '').split('|')
    const encrypt_arr = []
    let pathIsEncrypt = false
    for (const i in encrypt) {
      const encrypt_path = encrypt[i].split(':')[0]
      const pattern = ctx.helper.trim(encrypt_path, '/')
      if (ctx.helper.isEmpty(pattern)) {
        break
      }
      const encrypt_pass = ctx.helper.defaultValue(encrypt[i].split(':')[1], '')
      const regx = new RegExp(`^${pattern}`)
      if (regx.test(queryPath)) {
        if (encrypt_pass && password === encrypt_pass) {
          break
        }
        pathIsEncrypt = true
        resp.item = {encrypt: true}
        return resp
      }
      encrypt_arr.push(encrypt_path)
    }
    for (const i in hide) {
      const pattern = ctx.helper.trim(hide[i], '/')
      if (ctx.helper.isEmpty(pattern)) {
        break
      }
      const regx = new RegExp(`^${pattern}`)
      if (regx.test(queryPath)) {
        return resp
      }
    }
    path = ctx.helper.trim((root ? root : '') + '/' + queryPath, '/')
    const accessToken = await service.account.getAccessToken(account)
    let item = []
    try {
      item = await service.graph.getItemByPath(accessToken, path, params)
    } catch (err) {
      ctx.logger.error(err)
      return resp
    }

    const items = await service.graph.getItemsByPath(accessToken, path, params)

    // 目录
    if (items.value.length > 0) {
      const rows = map(items.value, (e) => {
        const fileType = typeof e.file === 'undefined'
        return {
          type: Number(fileType),
          name: e.name,
          size: ctx.helper.formatSize(Number(e.size)),
          mime: fileType ? '' : e.file.mimeType,
          time: dayjs(e.lastModifiedDateTime).format('YYYY-MM-DD HH:mm:ss'),
          ext: ctx.helper.getExtensionByName(e.name),
        }
      })
      resp.list = filter(rows, (row) => {
        let isHide = false
        for (const i in hide) {
          const pattern = ctx.helper.trim(hide[i], '/')
          if (ctx.helper.isEmpty(pattern)) {
            break
          }
          const regx = new RegExp(`^${pattern}`)
          if (regx.test(ctx.helper.trim(path + '/' + row.name, '/'))) {
            isHide = true
            break
          }
        }
        return !isHide && !ctx.helper.in_array(row.name, ['README.md', 'HEAD.md', '.password'], false)
      })

      if (item.file) {
        return resp
      }
      resp.item = {
        type: 1,
        name: item.name,
        size: ctx.helper.formatSize(Number(item.size)),
        time: dayjs(item.lastModifiedDateTime).format('YYYY-MM-DD HH:mm:ss'),
        childCount: resp.list.length,
        encrypt: pathIsEncrypt,
      }
      if (items['@odata.nextLink']) {
        const nextLinkQuery = url.parse(items['@odata.nextLink']).search
        const nextPageParams = ctx.helper.getQueryVariable(nextLinkQuery)
        resp.meta = {
          RowLimit: nextPageParams.$top,
          nextPageParams: {
            expand: nextPageParams.$expand,
            skip: nextPageParams.$skipToken,
            top: nextPageParams.$top,
          },
        }
      }

      return resp
    }
    const ext = ctx.helper.getExtensionByName(item.name)
    // 文件
    if (preview) {
      const content = await ctx.curl(item['@microsoft.graph.downloadUrl'], {
        dataType: 'text',
      })
      if (ctx.helper.in_array(ext, extension.txt)) {
        const rawContent = ctx.helper.getMime(item.name) === 'text/markdown' ? marked(content.data) : content.data
        resp.content = rawContent
      }
      return resp
    }
    let thumb = {}
    if (!ctx.helper.isEmpty(item.thumbnails)) {
      thumb = {
        small: item.thumbnails[0].small,
        medium: item.thumbnails[0].medium,
        large: item.thumbnails[0].large,
      }
    }
    resp.item = {
      type: 0,
      name: item.name,
      size: ctx.helper.formatSize(Number(item.size)),
      mime: item.file.mimeType,
      time: dayjs(item.lastModifiedDateTime).format('YYYY-MM-DD HH:mm:ss'),
      ext,
      url: item['@microsoft.graph.downloadUrl'],
      thumb,
      encrypt: pathIsEncrypt,
    }
    return resp
  }
}

module.exports = DataService
