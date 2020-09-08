'use strict';

const { pickBy, identity } = require('lodash');
const fse = require('fs-extra');
const Service = require('egg').Service;
const {
  Client,
  OneDriveLargeFileUploadTask,
} = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

const initAuthenticatedClient = (accessToken, baseUrl) => {
  const opts = {
    authProvider: done => {
      done(null, accessToken);
    },
    baseUrl,
  };

  const client = Client.init(opts);

  return client;
};
const convertPath = path => {
  if (path === void 0) {
    path = '/';
  }
  path = path.trim();
  if (path === '') {
    path = '/';
  }
  if (path[0] !== '/') {
    path = '/' + path;
  }
  if (path[path.length - 1] !== '/') {
    path = path + '/';
  }
  return path;
};

class GraphService extends Service {
  async getUserDetails(accessTokenObject) {
    const { accessToken, baseUrl } = accessTokenObject;
    const client = initAuthenticatedClient(accessToken, baseUrl);
    const user = await client.api('/me').get();
    return user;
  }
  async getUserDrive(accessTokenObject) {
    const { accessToken, baseUrl } = accessTokenObject;
    const client = initAuthenticatedClient(accessToken, baseUrl);
    const drive = await client.api('/me/drive').get();
    return drive;
  }
  async getItems(accessTokenObject, params) {
    let endpoint = '';
    params = pickBy(params, identity);
    const defaultParams = {
      itemId: '',
      top: 20,
      skip: '',
      expand: '',
    };
    const { accessToken, baseUrl } = accessTokenObject;
    const { itemId, top, skip, expand } = Object.assign(
      {},
      defaultParams,
      params || {}
    );
    if (itemId) {
      endpoint = `/me/drive/items/${itemId}/children`;
    } else {
      endpoint = '/me/drive/root/children';
    }
    const client = initAuthenticatedClient(accessToken, baseUrl);
    const items = await client
      .api(endpoint)
      .top(top)
      .skipToken(skip)
      .expand(expand)
      .get();
    return items;
  }
  async getItem(accessTokenObject, params) {
    let endpoint = '';
    params = pickBy(params, identity);
    const defaultParams = {
      itemId: '',
      expand: '',
    };
    const { accessToken, baseUrl } = accessTokenObject;
    const { itemId, expand } = Object.assign({}, defaultParams, params || {});
    if (itemId) {
      endpoint = `/me/drive/items/${itemId}`;
    } else {
      endpoint = '/me/drive/root';
    }
    const client = initAuthenticatedClient(accessToken, baseUrl);
    const item = await client.api(endpoint).expand(expand).get();
    return item;
  }
  async shareItem(accessTokenObject, params) {
    const { accessToken, baseUrl } = accessTokenObject;
    const { itemId } = params;
    const endpoint = `/me/drive/items/${itemId}/createLink`;
    const date = new Date();
    const body = {
      baseUrl: 'view',
      scope: 'anonymous',
      expirationDateTime: new Date(
        date.setDate(date.getDate() + 3)
      ).toISOString(),
    };
    const client = initAuthenticatedClient(accessToken, baseUrl);
    const data = await client.api(endpoint).post(body);
    return data;
  }

  async getItemPermissions(accessTokenObject, params) {
    const { accessToken, baseUrl } = accessTokenObject;
    const { itemId } = params;
    const endpoint = `/me/drive/items/${itemId}/permissions`;
    const client = initAuthenticatedClient(accessToken, baseUrl);
    const data = await client.api(endpoint).get();
    return data;
  }

  async upload(accessTokenObject, file, params) {
    const { accessToken, baseUrl } = accessTokenObject;
    let { path, fileName } = params;
    fileName = fileName.trim();
    path = convertPath(path);
    const endpoint = encodeURI(`/me/drive/root:/${path}${fileName}:/content`);
    const stream = fse.createReadStream(file);
    const client = initAuthenticatedClient(accessToken, baseUrl);
    const data = await client.api(endpoint).putStream(stream);
    return data;
  }

  async uploadResume(accessTokenObject, file, params) {
    const { accessToken, baseUrl } = accessTokenObject;
    let { fileName, path } = params;
    const client = initAuthenticatedClient(accessToken, baseUrl);
    fileName = fileName.trim();
    const oneDriveLargeFileUpload = async (client, file, fileName, path) => {
      try {
        const options = {
          path,
          fileName,
          rangeSize: 1024 * 1024,
        };
        const uploadTask = await OneDriveLargeFileUploadTask.create(
          client,
          file,
          options
        );
        const response = await uploadTask.upload();
        return response;
      } catch (err) {
        throw err;
      }
    };

    return fse
      .readFile(file, {})
      .then(file => {
        return oneDriveLargeFileUpload(client, file, fileName, path)
          .then(response => {
            this.logger.info(response);
            this.logger.info('File Uploaded Successfully.!!');
            return response;
          })
          .catch(error => {
            this.logger.info(error);
            throw error;
          });
      })
      .catch(err => {
        throw err;
      });
  }
}

module.exports = GraphService;
