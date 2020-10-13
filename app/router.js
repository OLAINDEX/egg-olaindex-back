'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const {router, controller} = app
  router.get('/', controller.home.index)

  router.post('/share', controller.share.index)
  router.post('/init', controller.init.index)
  router.get('/init/check', controller.init.check)
  router.get('/init/load', controller.init.load)

  router.post('/user/login', controller.user.login)

  router.get('/setting', controller.setting.index)
  router.post('/setting', controller.setting.update)

  router.post('/account/create', controller.account.create)

  router.get('/auth/login', controller.auth.login)
  router.get('/auth/callback', controller.auth.callback)

  router.get('/api/me', controller.api.getMe)
  router.get('/api/drive', controller.api.getDrive)
  router.get('/api/drive/list', controller.api.getItems)
  router.get('/api/drive/item', controller.api.getItem)
  router.get('/cache/clear', controller.cache.clear)
}
