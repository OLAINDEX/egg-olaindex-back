'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const {router, controller} = app
  router.get('/auth/callback', controller.auth.callback)

  router.get('/blocks', controller.block.list)
  router.post('/share', controller.share.index)

  router.post('/user/login', controller.user.login)
  router.get('/user', controller.user.profile)
  router.post('/user', controller.user.profile)

  router.post('/init', controller.init.index)
  router.get('/init/check', controller.init.check)
  router.get('/init/load', controller.init.load)

  router.get('/account/list', controller.account.list)
  router.get('/account/view', controller.account.view)
  router.post('/account/init', controller.account.init)
  router.post('/account/update', controller.account.update)
  router.post('/account/delete', controller.account.delete)
  router.post('/account/mark', controller.account.mark)
  router.post('/account/config', controller.account.updateConfig)
  router.get('/account/config', controller.account.fetchConfig)

  router.get('/setting', controller.setting.index)
  router.post('/setting', controller.setting.update)
  router.get('/cache/clear', controller.cache.clear)
  router.get('/t', controller.test.index)
}
