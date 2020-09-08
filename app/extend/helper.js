'use strict';
const axios = require('axios');
const mime = require('mime');

const renderError = (message, secondaryMessage = 'Opps!') => {
  return `
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport"content="width=device-width, initial-scale=1"><title>${secondaryMessage}</title><!--Fonts--><link rel="dns-prefetch"href="//fonts.gstatic.com"><link href="https://fonts.lug.ustc.edu.cn/css?family=Nunito"rel="stylesheet"><!--Styles--><style>html,body{background-color:#fff;color:#636b6f;font-family:'Nunito',sans-serif;font-weight:100;height:100vh;margin:0}.full-height{height:100vh}.flex-center{align-items:center;display:flex;justify-content:center}.position-ref{position:relative}.code{border-right:2px solid;font-size:26px;padding:0 15px 0 15px;text-align:center}.message{font-size:18px;text-align:center}</style></head><body><div class="flex-center position-ref full-height"><div class="code">${secondaryMessage}</div><div class="message"style="padding: 10px;">${message}</div></div></body></html>
  `;
};

const timeFormat = (time, format) => {
  const o = {
    'M+': time.getMonth() + 1,
    'd+': time.getDate(),
    'h+': time.getHours(),
    'm+': time.getMinutes(),
    's+': time.getSeconds(),
    'q+': Math.floor((time.getMonth() + 3) / 3),
    S: time.getMilliseconds(),
  };
  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (time.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
    }
  }
  return format;
};

const checkIsJSON = str => {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  return false;
};

const randomString = (len, charSet) => {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
};


const request = axios.create({
  timeout: 10000,
});
request.interceptors.request.use(
  config => {
    config.url = encodeURI(config.url);
    return config;
  },
  error => {
    console.log(error);
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);


const Response_file = (file, url = '?download') => {
  return {
    type: 0, // 0_file 固定值
    statusCode: 200, // 200 固定值
    data: {
      file,
      url,
    },
  };
};

const Response_list = (list, nextToken) => {
  return {
    type: 1, // 1_dir 固定值
    statusCode: 200, // 固定值
    data: {
      list, nextToken,
    },
  };
};

const Response_info = (statusCode, info, headers) => {
  const m = {
    type: 2, // 2_info 固定值
    statusCode, // enum: 200 301 401 403 404 500
    headers,
    data: {
      info: info || statusCode,
    },
  };
  return m;
};

const Response_html = (statusCode, html, headers) => {
  return {
    type: 3, // 3_html 固定值
    statusCode, // enum: 200 301 401 403 404 500
    headers: headers || { 'Content-Type': 'text/html' },
    data: {
      html, // html text
    },
  };
};

const Response_html_json = (statusCode, obj, headers) => {
  return {
    type: 3, // 3_html 固定值
    statusCode,
    headers: headers || { 'Content-Type': 'application/json' },
    data: {
      html: JSON.stringify(obj),
    },
  };
};

const Response_error = (statusCode, info, headers) => {
  const m = {
    type: 2,
    statusCode,
    headers,
    data: {
      info: info || statusCode,
    },
  };
  const e = new Error(m.data.info);
  return Object.assign(e, m);
};

const Response_download = async req => {
  // if (authorization) headers.authorization = this.authorization;
  // if (range) headers.range = this.range;
  // @flag 以后支持导出下载链接
  const res = await axios({ url: req.url, headers: req.headers, method: req.method || 'get', responseType: 'stream' });
  return Response_html(res.status, res.data, res.headers);
};

const Response = {
  file: Response_file,
  list: Response_list,
  info: Response_info,
  html: Response_html,
  html_json: Response_html_json,
  error: Response_error,
  down: Response_download,
  constants: {
    Incomplete_folder_path: 'Incomplete folder path',
    No_such_command: 'No such command',
    Just_for_mounting: 'Just for mounting |-_-',
    Download_not_allowed: 'Download not allowed',
    File_already_exists: 'File already exists',
    Content_Range_is_invalid: 'Content-Range is invalid',
    Offset_is_invalid: 'Offset is invalid',
    Range_is_invalid: 'Range is invalid',
    S404_not_found: '404 Not Found',
    Permission_denied: 'Permission denied',
    System_not_initialized: 'The system is not initialized',
  },
};

const urlSpCharEncode = s => {
  return !s ? s : s.replace(/%/g, '%25').replace(/#/g, '%23');
};
const formatSize = size => {
  if (typeof size !== 'number') size = NaN;
  let count = 0;
  while (size >= 1024) {
    size /= 1024;
    count++;
  }
  size = size.toFixed(2);
  size += [ ' B', ' KB', ' MB', ' GB', ' TB' ][count];
  return size;
};

const getMime = path => {
  return mime.getType(path) || 'application/vnd.onepoint.unknown';
};

module.exports = {
  renderError,
  timeFormat,
  checkIsJSON,
  randomString,
  request,
  Response,
  formatSize,
  urlSpCharEncode,
  getMime,
};
