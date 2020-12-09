'use strict'
const dayjs = require('dayjs')
const {checkIsJSON} = require('../extend/helper')
/**
 *
 * @param {Egg.Application} app Application
 */
module.exports = (app) => {
  const {DataTypes} = app.Sequelize

  const Account = app.model.define(
    'account',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      remark: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: '',
      },
      type: {
        type: DataTypes.TINYINT(3),
        allowNull: false,
        defaultValue: 0,
      },
      client_id: {
        type: DataTypes.STRING(128),
        allowNull: false,
        defaultValue: '',
      },
      client_secret: {
        type: DataTypes.STRING(128),
        allowNull: false,
        defaultValue: '',
      },
      redirect_uri: {
        type: DataTypes.STRING(128),
        allowNull: false,
        defaultValue: '',
      },
      access_token: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      expires_on: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        defaultValue: 0,
      },
      share_uri: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '',
      },
      config: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        set(val) {
          if (typeof val !== 'string') {
            this.setDataValue('config', JSON.stringify(val))
          } else {
            this.setDataValue('config', val)
          }
        },
        get() {
          const value = this.getDataValue('config')
          if (checkIsJSON(value)) {
            return JSON.parse(value)
          }
          return value
        },
      },
      raw: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
        set(val) {
          if (typeof val !== 'string') {
            this.setDataValue('raw', JSON.stringify(val))
          } else {
            this.setDataValue('raw', val)
          }
        },
        get() {
          const value = this.getDataValue('raw')
          if (checkIsJSON(value)) {
            return JSON.parse(value)
          }
          return value
        },
      },
      created_at: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
    },
    {
      timestamps: false,
      hooks: {
        beforeCreate: (obj) => {
          const now = dayjs().unix()
          obj.created_at = now
          obj.updated_at = now
        },

        beforeUpdate: (obj) => {
          const now = dayjs().unix()
          obj.updated_at = now
        },
      },
    },
  )

  Account.sync()
  return Account
}
