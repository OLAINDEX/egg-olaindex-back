'use strict'

const {checkIsJSON} = require('../extend/helper')
/**
 *
 * @param {Egg.Application} app Application
 */
module.exports = (app) => {
  const {DataTypes} = app.Sequelize

  const Setting = app.model.define(
    'setting',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: true,
        set(val) {
          if (typeof val !== 'string') {
            this.setDataValue('value', JSON.stringify(val))
          } else {
            this.setDataValue('value', val)
          }
        },
        get() {
          const value = this.getDataValue('value')
          if (checkIsJSON(value)) {
            return JSON.parse(value)
          }
          return value
        },
      },
    },
    {
      timestamps: false,
    },
  )
  Setting.sync()
  return Setting
}
