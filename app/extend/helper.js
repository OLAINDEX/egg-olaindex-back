'use strict'

const mime = require('mime')

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

module.exports = {
  renderError,
  timeFormat,
  checkIsJSON,
  randomString,
  formatSize,
  urlSpCharEncode,
  getMime,
  trim,
}
