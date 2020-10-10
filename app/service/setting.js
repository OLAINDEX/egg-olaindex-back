'use strict'

const Service = require('egg').Service
const {forEach, map, filter} = require('lodash')
const {isEmpty, in_array} = require('../extend/helper')

class SettingService extends Service {
  async fetchAll() {
    const {app} = this
    const config = await app.model.Setting.findAll({attributes: ['name', 'value']})
    const data = {}
    forEach(config, (el) => {
      data[el.name] = el.value
    })
    return data
  }
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
    const saved = map(all, (el) => {
      return el.toJSON().name
    })
    const newItems = filter(rows, (el) => {
      return !in_array(el.name, saved, false)
    })
    const updateItems = filter(rows, (el) => {
      return in_array(el.name, saved, false)
    })
    if (!isEmpty(newItems)) {
      await app.model.Setting.bulkCreate(newItems)
    }
    forEach(updateItems, (config) => {
      app.model.Setting.findOne({
        where: {name: config.name},
      }).then((item) => {
        if (config.value !== item.value) {
          item.update({
            value: config.value,
          })
        }
      })
    })
    return data
  }
}

module.exports = SettingService
