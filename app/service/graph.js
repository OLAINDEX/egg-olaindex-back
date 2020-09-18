'use strict'

const {pickBy, identity} = require('lodash')
const fs = require('fs-extra')
const Service = require('egg').Service
const {Client, OneDriveLargeFileUploadTask} = require('@microsoft/microsoft-graph-client')
require('isomorphic-fetch')

class GraphService extends Service {
  initAuthenticatedClient(accessToken, baseUrl, defaultVersion = 'v1.0') {
    const opts = {
      authProvider: (done) => {
        done(null, accessToken)
      },
      baseUrl,
      defaultVersion,
    }

    const client = Client.init(opts)

    return client
  }

  convertPath(path) {
    if (path === void 0) {
      path = '/'
    }
    path = path.trim()
    if (path === '') {
      path = '/'
    }
    if (path[0] !== '/') {
      path = '/' + path
    }
    if (path[path.length - 1] !== '/') {
      path = path + '/'
    }
    return path
  }

  async getUserDetails(accessTokenObject) {
    const {accessToken, baseUrl, defaultVersion} = accessTokenObject
    const client = this.initAuthenticatedClient(accessToken, baseUrl, defaultVersion)
    const user = await client.api('/me').get()
    return user
  }

  async getUserDrive(accessTokenObject) {
    const {accessToken, baseUrl, defaultVersion} = accessTokenObject
    const client = this.initAuthenticatedClient(accessToken, baseUrl, defaultVersion)
    const drive = await client.api('/me/drive').get()
    return drive
  }

  async getItems(accessTokenObject, params) {
    let endpoint = ''
    params = pickBy(params, identity)
    const defaultParams = {
      itemId: '',
      top: 20,
      skip: '',
      expand: '',
    }
    const {accessToken, baseUrl, defaultVersion} = accessTokenObject
    const {itemId, top, skip, expand} = Object.assign({}, defaultParams, params || {})
    if (itemId) {
      endpoint = `/me/drive/items/${itemId}/children`
    } else {
      endpoint = '/me/drive/root/children'
    }
    const client = this.initAuthenticatedClient(accessToken, baseUrl, defaultVersion)
    const items = await client.api(endpoint).top(top).skipToken(skip).expand(expand).get()
    return items
  }

  async getItem(accessTokenObject, params) {
    let endpoint = ''
    params = pickBy(params, identity)
    const defaultParams = {
      itemId: '',
      expand: '',
    }
    const {accessToken, baseUrl, defaultVersion} = accessTokenObject
    const {itemId, expand} = Object.assign({}, defaultParams, params || {})
    if (itemId) {
      endpoint = `/me/drive/items/${itemId}`
    } else {
      endpoint = '/me/drive/root'
    }
    const client = this.initAuthenticatedClient(accessToken, baseUrl, defaultVersion)
    const item = await client.api(endpoint).expand(expand).get()
    return item
  }

  async shareItem(accessTokenObject, params) {
    const {accessToken, baseUrl, defaultVersion} = accessTokenObject
    const {itemId} = params
    const endpoint = `/me/drive/items/${itemId}/createLink`
    const date = new Date()
    const body = {
      baseUrl: 'view',
      scope: 'anonymous',
      expirationDateTime: new Date(date.setDate(date.getDate() + 3)).toISOString(),
    }
    const client = this.initAuthenticatedClient(accessToken, baseUrl, defaultVersion)
    const data = await client.api(endpoint).post(body)
    return data
  }

  async getItemPermissions(accessTokenObject, params) {
    const {accessToken, baseUrl, defaultVersion} = accessTokenObject
    const {itemId} = params
    const endpoint = `/me/drive/items/${itemId}/permissions`
    const client = this.initAuthenticatedClient(accessToken, baseUrl, defaultVersion)
    const data = await client.api(endpoint).get()
    return data
  }

  async upload(accessTokenObject, file, params) {
    const {accessToken, baseUrl, defaultVersion} = accessTokenObject
    let {path, fileName} = params
    fileName = fileName.trim()
    path = this.convertPath(path)
    const endpoint = encodeURI(`/me/drive/root:/${path}${fileName}:/content`)
    const stream = fs.createReadStream(file)
    const client = this.initAuthenticatedClient(accessToken, baseUrl, defaultVersion)
    const data = await client.api(endpoint).putStream(stream)
    return data
  }

  async uploadResume(accessTokenObject, file, params) {
    const {accessToken, baseUrl, defaultVersion} = accessTokenObject
    let {fileName, path} = params
    const client = this.initAuthenticatedClient(accessToken, baseUrl, defaultVersion)
    fileName = fileName.trim()
    const oneDriveLargeFileUpload = async (client, file, fileName, path) => {
      try {
        const options = {
          path,
          fileName,
          rangeSize: 1024 * 1024,
        }
        const uploadTask = await OneDriveLargeFileUploadTask.create(client, file, options)
        const response = await uploadTask.upload()
        return response
      } catch (err) {
        throw err
      }
    }

    return fs
      .readFile(file, {})
      .then((file) => {
        return oneDriveLargeFileUpload(client, file, fileName, path)
          .then((response) => {
            this.logger.info(response)
            this.logger.info('File Uploaded Successfully.!!')
            return response
          })
          .catch((error) => {
            this.logger.info(error)
            throw error
          })
      })
      .catch((err) => {
        throw err
      })
  }
}

module.exports = GraphService
