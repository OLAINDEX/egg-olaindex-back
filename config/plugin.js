'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  static: {
    enable: true,
  },
  cache: {
    enable: true,
    package: 'egg-cache',
  },
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },
};
