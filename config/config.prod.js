/* eslint valid-jsdoc: "off" */

'use strict';


/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = {
  userConfig: {
    redirect_uri: 'http://localhost:3000/auth/callback',
    scope: 'offline_access user.read files.readwrite.all',
    rest_endpoint: 'https://graph.microsoft.com/',
    rest_endpoint_cn: 'https://microsoftgraph.chinacloudapi.cn/',
  },
};
