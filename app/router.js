'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const {router, controller} = app
  router.get('/', controller.home.index)

  router.post('/share', controller.share.index)
  router.get('/test', controller.test.index)

  router.post('/user/login', controller.user.login)

  router.get('/auth/login', controller.auth.login)
  router.get('/auth/callback', controller.auth.callback)

  router.get('/api/me', controller.api.getMe)
  router.get('/api/drive', controller.api.getDrive)
  router.get('/api/drive/list', controller.api.getItems)
  router.get('/api/drive/item', controller.api.getItem)
  router.get('/cache/clear', controller.cache.clear)
}
