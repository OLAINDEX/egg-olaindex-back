'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const jwt = app.middleware.jwt({
    secret: '0eMM1Y0p5L',
    ignore: ['/user/login'],
  })
  const {router, controller} = app
  router.get('/auth/callback', controller.auth.callback)

  router.get('/blocks', controller.block.list)
  router.post('/share', controller.share.index)

  router.post('/user/login', controller.user.login)

  router.get('/user', jwt, controller.user.profile)
  router.post('/user', jwt, controller.user.update)

  router.post('/init', controller.init.index)
  router.get('/init/check', controller.init.check)
  router.get('/init/load', controller.init.load)

  router.get('/account/list', jwt, controller.account.list)
  router.get('/account/view', jwt, controller.account.view)
  router.post('/account/init', jwt, controller.account.init)
  router.post('/account/update', jwt, controller.account.update)
  router.post('/account/delete', jwt, controller.account.delete)
  router.post('/account/setMain', jwt, controller.account.setMain)
  router.post('/account/config', jwt, controller.account.updateConfig)
  router.get('/account/config', jwt, controller.account.fetchConfig)

  router.get('/setting', jwt, controller.setting.index)
  router.post('/setting', jwt, controller.setting.update)
  router.get('/cache/clear', jwt, controller.cache.clear)
}
