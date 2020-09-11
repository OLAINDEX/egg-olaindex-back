'use strict';

const path = require('path');
const fse = require('fs-extra');
const Subscription = require('egg').Subscription;
const token = fse.readJsonSync(path.resolve(__dirname, './../../storage/access_token.json'));
class RefreshToken extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '5m', // 间隔
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const { ctx, service } = this;
    const accessToken = await service.token.getAccessToken(token);
    ctx.logger.info(accessToken);
  }
}

module.exports = RefreshToken;
