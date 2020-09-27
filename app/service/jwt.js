'use strict'
const jwt = require('jsonwebtoken')
const Service = require('egg').Service

class JwtService extends Service {
  signToken(payload, options) {
    const token = jwt.sign(payload, this.config.jwt.secret, options)
    return token
  }
  isExpired(token, second) {
    try {
      const payload = jwt.verify(token, this.config.jwt.secret) || {}
      const {exp} = payload,
        current = Math.floor(Date.now() / 1000)
      if (exp - current <= second) {
        return true
      }
    } catch (e) {
      this.logger.error(e)
    }
    return false
  }
  verifyToken(token) {
    let data = {}
    try {
      const payload = jwt.verify(token, this.config.jwt.secret) || {}
      const {exp} = payload,
        current = Math.floor(Date.now() / 1000)
      if (current <= exp) data = payload || {}
    } catch (e) {
      this.logger.error(e)
    }
    return data
  }
  refresh(token, options) {
    const data = ''
    try {
      const payload = jwt.verify(token, this.config.jwt.secret) || {}
      delete payload.iat
      delete payload.exp
      delete payload.nbf
      delete payload.jti
      return jwt.sign(payload, this.config.jwt.secret, options)
    } catch (e) {
      this.logger.error(e)
    }
    return data
  }
}

module.exports = JwtService
