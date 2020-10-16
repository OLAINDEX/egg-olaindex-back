'use strict'

const Subscription = require('egg').Subscription
const {forEach} = require('lodash')
class ShareUpdate extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '5m', // 间隔
      type: 'all', // 指定所有的 worker 都需要执行
    }
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const {app, ctx, service} = this
    const TYPE_SHARE = 0
    const accounts = await app.model.Account.findAll()
    forEach(accounts, async (account) => {
      const type = account.type
      if (type === TYPE_SHARE) {
        const share_uri = account.share_uri
        ctx.logger.info(share_uri)
        const data = await service.share.parseShareUrlParams(share_uri)
        const token = await service.share.getAccessToken(data)
        const raw = {...data, ...token}
        await account.update({raw, access_token: token.accessToken})
      } else {
        await service.account.getAccessToken(account)
      }
      ctx.logger.info('refresh:' + account.id)
    })
  }
}

module.exports = ShareUpdate
