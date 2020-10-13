'use strict'

const Service = require('egg').Service

class AccountService extends Service {
  index() {}
  async create(data) {
    const {app} = this
    const account = await app.model.Account.create(data)
    account.save()
  }
}

module.exports = AccountService
