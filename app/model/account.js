'use strict'

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
      expiresIn: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: false,
    },
  )

  Account.sync()
  return Account
}
