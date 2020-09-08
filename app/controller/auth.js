'use strict';

const path = require('path');
const fse = require('fs-extra');
const Controller = require('egg').Controller;
const { AuthorizationCode } = require('simple-oauth2');

class AuthController extends Controller {
  async login() {
    const { app, ctx } = this;
    const { type } = ctx.query;
    const state = ctx.helper.randomString(20);
    ctx.session.state = state;
    await app.cache.set(state, type, 300);
    let config = app.config.oauth2;
    if (type === 'cn') {
      config = app.config.oauth2_cn;
    }
    const client = new AuthorizationCode(config);
    const authorizationUri = client.authorizeURL({
      redirect_uri: app.config.userConfig.redirect_uri,
      scope: app.config.userConfig.scope.split(' '),
      state,
    });
    ctx.redirect(authorizationUri);
  }
  async callback() {
    const { app, ctx } = this;
    const session_state = ctx.session.state || '';
    const { code, state } = ctx.query;
    if (session_state !== state) {
      ctx.body = ctx.helper.renderError('Invaild state');
    }
    let config = app.config.oauth2;
    const tokenConfig = {
      code,
      redirect_uri: app.config.userConfig.redirect_uri,
      scope: app.config.userConfig.scope.split(' '),
    };
    const type = await app.cache.get(state);
    if (type === 'cn') {
      config = app.config.oauth2_cn;
      tokenConfig.resource = app.config.userConfig.rest_endpoint_cn;
    }
    try {
      const client = new AuthorizationCode(config);
      const accessToken = await client.getToken(tokenConfig);
      let token = accessToken.token;
      if (type === 'cn') {
        token = Object.assign({}, token, { type: 'cn' });
      }
      fse.writeJsonSync(path.resolve(__dirname, './../../storage/access_token.json'), token);
      ctx.logger.info(token);
      ctx.logger.info('Access Token Success');
    } catch (error) {
      ctx.logger.error('Access Token Error', error.message);
      ctx.body = ctx.helper.renderError('Access Token Error');
    }
    ctx.redirect('/');
  }
}

module.exports = AuthController;
