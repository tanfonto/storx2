module.exports = {
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": [
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2019,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/prefer-interface": 0,
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/no-non-null-assertion": "off"
  }
}
