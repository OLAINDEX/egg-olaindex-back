'use strict'

const path = require('path')
const fs = require('fs-extra')
const Subscription = require('egg').Subscription
const share = fs.readJsonSync(path.resolve(__dirname, './../../storage/share_conf.json'))
class ShareUpdate extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '10m', // 间隔
      type: 'all', // 指定所有的 worker 都需要执行
    }
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const shareUrl = share.shareUrl
    const {ctx, service} = this
    const params = await service.share.parseShareUrlParams(shareUrl)
    const token = await service.share.getAccessToken(params)
    fs.writeJsonSync(path.resolve(__dirname, './../../storage/share_token.json'), {...params, ...token})
    ctx.logger.info({...params, ...token})
    service.setting.batchUpdate({share_token: {...params, ...token}})
  }
}

module.exports = ShareUpdate
