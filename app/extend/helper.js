'use strict'

const mime = require('mime')
const crypto = require('crypto')

const renderError = (message, secondaryMessage = 'Opps!') => {
  return `
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport"content="width=device-width, initial-scale=1"><title>${secondaryMessage}</title><!--Fonts--><link rel="dns-prefetch"href="//fonts.gstatic.com"><link href="https://fonts.lug.ustc.edu.cn/css?family=Nunito"rel="stylesheet"><!--Styles--><style>html,body{background-color:#fff;color:#636b6f;font-family:'Nunito',sans-serif;font-weight:100;height:100vh;margin:0}.full-height{height:100vh}.flex-center{align-items:center;display:flex;justify-content:center}.position-ref{position:relative}.code{border-right:2px solid;font-size:26px;padding:0 15px 0 15px;text-align:center}.message{font-size:18px;text-align:center}</style></head><body><div class="flex-center position-ref full-height"><div class="code">${secondaryMessage}</div><div class="message"style="padding: 10px;">${message}</div></div></body></html>
  `
}

const timeFormat = (time, format) => {
  const o = {
    'M+': time.getMonth() + 1,
    'd+': time.getDate(),
    'h+': time.getHours(),
    'm+': time.getMinutes(),
    's+': time.getSeconds(),
    'q+': Math.floor((time.getMonth() + 3) / 3),
    S: time.getMilliseconds(),
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return format
}

const checkIsJSON = (str) => {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }
  return false
}

const randomString = (len, charSet) => {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length)
    randomString += charSet.substring(randomPoz, randomPoz + 1)
  }
  return randomString
}

const urlSpCharEncode = (s) => {
  return !s ? s : s.replace(/%/g, '%25').replace(/#/g, '%23')
}

const formatSize = (size) => {
  if (typeof size !== 'number') size = NaN
  let count = 0
  while (size >= 1024) {
    size /= 1024
    count++
  }
  size = size.toFixed(2)
  size += [' B', ' KB', ' MB', ' GB', ' TB'][count]
  return size
}

const getMime = (path) => {
  return mime.getType(path) || 'application/vnd.olaindex.unknown'
}

const trim = (str, char, type) => {
  if (char) {
    if (type === 'left') {
      return str.replace(new RegExp('^\\' + char + '+', 'g'), '')
    } else if (type === 'right') {
      return str.replace(new RegExp('\\' + char + '+$', 'g'), '')
    }
    return str.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '')
  }
  return str.replace(/^\s+|\s+$/g, '')
}

const in_array = (needle, haystack, argStrict) => {
  let key = ''
  const strict = !!argStrict
  if (strict) {
    for (key in haystack) {
      if (haystack[key] === needle) {
        return true
      }
    }
  } else {
    for (key in haystack) {
      // eslint-disable-next-line
      if (haystack[key] == needle) {
        return true
      }
    }
  }

  return false
}

const hash = (key, prefix = 'eggjs') => {
  return (
    prefix +
    '_' +
    crypto
      .createHash('md5')
      .update(key + '')
      .digest('hex')
  )
}

const defaultValue = (value, defaultValue) => {
  switch (value) {
    case 'null':
    case 'undefined':
    case null:
    case undefined:
    case '':
      return defaultValue
    default:
      return value
  }
}

const getQueryVariable = (url) => {
  const query = {}
  if (!url) {
    return query
  }
  if (url.indexOf('?') !== -1) {
    const str = url.substr(1)
    const pairs = str.split('&')
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=')
      query[pair[0]] = pair[1]
    }
  }
  return query
}

const updateQueryStringParameter = (uri, key, value) => {
  if (!value) {
    return uri
  }
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
  const separator = uri.indexOf('?') !== -1 ? '&' : '?'
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + value + '$2')
  }
  return uri + separator + key + '=' + value
}

const isEmpty = (obj) => [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length

const getExtensionByName = (filename) => {
  // eslint-disable-next-line no-bitwise
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

const response = (data = [], code = 0, msg = 'ok') => {
  const buildResponse = (data = [], code = 0, msg = 'ok') => {
    data = {
      data,
      msg,
      code,
      status: code === 0,
    }
    return data
  }

  return buildResponse(data, code, msg)
}
module.exports = {
  renderError,
  timeFormat,
  checkIsJSON,
  randomString,
  formatSize,
  urlSpCharEncode,
  getMime,
  trim,
  in_array,
  hash,
  defaultValue,
  getQueryVariable,
  updateQueryStringParameter,
  isEmpty,
  getExtensionByName,
  response,
}
