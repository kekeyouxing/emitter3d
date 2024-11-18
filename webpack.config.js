const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const isProduction = process.env.NODE_ENV == 'production';


module.exports = {
  mode: 'production',
  entry: __dirname + '/src/index.tsx',
  output: {
    path: __dirname + '/dist',
    publicPath: '/emitter3d',
    filename: 'emitter3d.js',
    library: 'emitter3d',
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
  resolve: {
    extensions: ['*', '.js', '.ts', '.tsx'],
  },
  devtool: isProduction ? false : 'source-map',
  devServer: {
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
    static: {
      directory: __dirname + '/dist',
      publicPath: '/emitter3d',
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/application/config.txt'), to: path.resolve(__dirname, 'dist') },
        { from: path.resolve(__dirname, 'src/sounds'), to: path.resolve(__dirname, 'dist/sounds') },
      ],
    }),
  ],
};
