'use strict'

/**
 *
 * @param {Egg.Application} app Application
 */
module.exports = (app) => {
  const {STRING, BOOLEAN, INTEGER, DATE} = app.Sequelize

  const User = app.model.define('user', {
    id: {type: INTEGER, primaryKey: true, autoIncrement: true},
    name: {
      type: STRING(32),
      unique: true,
    },
    is_admin: BOOLEAN,
    status: INTEGER,
    password: STRING,
    created_at: DATE,
    updated_at: DATE,
  })

  return User
}
