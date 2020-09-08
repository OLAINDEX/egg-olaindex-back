'use strict';

const Controller = require('egg').Controller;

class CacheController extends Controller {
  async clear() {
    const { app, ctx } = this;
    await app.cache.reset();
    ctx.body = 'Cache cleared';
  }
}

module.exports = CacheController;
