const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlWebpackTemplate = require('html-webpack-template');
const CleanPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const pkg = require('./package.json');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
  style: path.join(__dirname, 'app/main.css'),
  searchIndex: path.join(__dirname, 'app/search_index.json')
};

const common = {
  entry: {
    app: PATHS.app,
    style: PATHS.style
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }],
        include: PATHS.app
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: htmlWebpackTemplate,
      title: 'Lunr demo',
      appMountId: 'app',
      inject: false
    })
  ]
};

const dev = merge(common, {
  devtool: 'eval-source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,

    // display only errors to reduce the amount of output
    stats: 'errors-only',

    // parse host and port from env so this is easy
    // to customize
    host: process.env.HOST,
    port: process.env.PORT
  },
  module: {
    loaders: [
      // Define development specific CSS setup
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: PATHS.app
      }
    ]
  },
  performance: {
    hints: false
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});

const build = {
  entry: {
    vendor: Object.keys(pkg.dependencies)
  },
  output: {
    path: PATHS.build,
    filename: '[name].[chunkhash].js',
    chunkFilename: '[chunkhash].js'
  },
  module: {
    rules: [
      // Extract CSS during build
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: 'css-loader'
        }),
        include: PATHS.app
      }
    ]
  },
  plugins: [
    new CleanPlugin([PATHS.build]),
    // Output extracted CSS to a file
    new ExtractTextPlugin('[name].[chunkhash].css'),
    // Extract vendor and manifest files
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest']
    }),
    // Setting DefinePlugin affects React library size!
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
};

module.exports = function(env) {
  process.env.BABEL_ENV = env;

  if (env === 'build') {
    return merge(common, build)
  }

  return merge(common, dev);
};
