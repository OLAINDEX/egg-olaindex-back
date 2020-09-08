/* eslint valid-jsdoc: "off" */

'use strict';

const fsStore = require('cache-manager-fs-hash');
const redisStore = require('cache-manager-redis-store');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1599525172557_9843';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    redirect_uri: '',
    scope: 'offline_access user.read files.readwrite.all',
    rest_endpoint: 'https://graph.microsoft.com/',
    rest_endpoint_cn: 'https://microsoftgraph.chinacloudapi.cn/',
  };

  const cache = {
    default: 'fs',
    stores: {
      memory: {
        driver: 'memory',
        max: 100,
        ttl: 0,
      },
      fs: {
        driver: fsStore,
        path: 'cache', // path for cached files
        ttl: 60 * 60, // time to life in seconds
        subdirs: false,
        zip: true, // zip files to save diskspace (default: false)
      },
      redis: {
        driver: redisStore,
        host: 'localhost', // default value
        port: 6379, // default value
        auth_pass: '',
        db: 0,
        ttl: 600,
      },
    },
  };

  const oauth2 = {
    client: {
      id: '81c0ba72-5ff2-4d48-b3dc-e2d699a2e4fd',
      secret: '0eMM1Y0p5L-s64~Dd3VkS5TY3HPYv~uO5-',
    },
    auth: {
      tokenHost: 'https://login.microsoftonline.com/common/',
      authorizePath: 'oauth2/v2.0/authorize',
      tokenPath: 'oauth2/v2.0/token',
    },
  };

  const oauth2_cn = {
    client: {
      id: '833d0c0f-9351-44b3-b020-200084b49706',
      secret: 'MlxI9yxQP-s6vK6xYz-_eMl8_MN~4yuvl5',
    },
    auth: {
      tokenHost: 'https://login.partner.microsoftonline.cn/common/',
      authorizePath: 'oauth2/authorize',
      tokenPath: 'oauth2/token',
    },
  };

  return {
    ...config,
    ...userConfig,
    cache,
    oauth2,
    oauth2_cn,
  };
};
