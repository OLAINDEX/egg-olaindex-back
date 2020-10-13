'use strict'
const dayjs = require('dayjs')
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
        beforeValidate: (obj) => {
          const now = dayjs().unix()
          if (obj.isNewRecord) {
            obj.created_at = now
            obj.updated_at = now
          } else {
            obj.updated_at = dayjs().unix()
          }
        },
      },
    },
  )

  Account.sync()
  return Account
}
