'use strict'
const dayjs = require('dayjs')
/**
 *
 * @param {Egg.Application} app Application
 */
module.exports = (app) => {
  const {DataTypes} = app.Sequelize

  const User = app.model.define(
    'user',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(32),
        unique: {
          args: true,
          msg: '用户已经存在.',
        },
      },
      password: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
      },
      is_admin: {
        type: DataTypes.BOOLEAN,
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
  User.sync()
  return User
}
