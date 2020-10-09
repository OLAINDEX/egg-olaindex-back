'use strict'

const Service = require('egg').Service
const {map, forEach} = require('lodash')

class SettingService extends Service {
  async batchUpdate(data = []) {
    const {app} = this
    const rows = []
    forEach(data, (value, key) => {
      rows.push({
        name: key,
        value,
      })
    })
    const all = await app.model.Setting.findAll({
      attributes: ['name'],
    })
    const res = map(all, (el) => {
      return el.toJSON()
    })
    this.logger.info(res)
    return res
    // const newItems = filter(rows, (el) => {
    //   return !in_array(el.name, all, false)
    // })
    // const updateItems = filter(rows, (el) => {
    //   return in_array(el.name, all, false)
    // })
    // return data
  }
}

module.exports = SettingService
