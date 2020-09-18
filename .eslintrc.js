module.exports = {
  parser: 'eslint-config-egg',
  parser: 'babel-eslint',
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'eslint-config-egg',
    'plugin:prettier/recommended',
    'prettier',
  ],
  rules: {},
}
