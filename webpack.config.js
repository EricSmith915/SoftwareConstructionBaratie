// const path = require('path')

// module.exports = {
//   mode: 'development',
//   entry: {
//     index: './src/index.js',
//     signUp: './src/signUp.js',
//     cart: './src/cart.js',
//   },
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: '[name].bundle.js'
//   },
//   watch: true
// }
const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
    menu: ['./src/loginFunctions.js', './src/auth.js', './src/menu.js'],
    signUp: './src/signUp.js',
    login: ['./src/loginFunctions.js', './src/auth.js'],
    cart: ['./src/loginFunctions.js', './src/auth.js', './src/cart.js'],
    user: ['./src/loginFunctions.js', './src/auth.js', './src/user.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  watch: true
}