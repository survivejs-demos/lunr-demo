const path = require("path");
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const { MiniHtmlWebpackPlugin } = require("mini-html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const pkg = require("./package.json");

const PATHS = {
  app: path.join(__dirname, "app"),
  build: path.join(__dirname, "build"),
  style: path.join(__dirname, "app/main.css"),
  searchIndex: path.join(__dirname, "app/search_index.json"),
};

const common = {
  entry: {
    app: PATHS.app,
    style: PATHS.style,
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  output: {
    path: PATHS.build,
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        include: PATHS.app,
      },
    ],
  },
  plugins: [
    new MiniHtmlWebpackPlugin({
      title: "Lunr demo",
    }),
  ],
};

const dev = merge(common, {
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,

    // display only errors to reduce the amount of output
    stats: "errors-only",

    // parse host and port from env so this is easy
    // to customize
    host: process.env.HOST,
    port: process.env.PORT,
  },
  module: {
    rules: [
      // Define development specific CSS setup
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        include: PATHS.app,
      },
    ],
  },
  performance: {
    hints: false,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
  ],
});

const build = {
  entry: {
    vendor: Object.keys(pkg.dependencies),
  },
  output: {
    path: PATHS.build,
    filename: "[name].[chunkhash].js",
    chunkFilename: "[chunkhash].js",
  },
  module: {
    rules: [
      // Extract CSS during build
      {
        test: /\.css$/,
        loader: [MiniCssExtractPlugin.loader, "css-loader"],
        include: PATHS.app,
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  plugins: [new CleanWebpackPlugin(), new MiniCssExtractPlugin()],
};

module.exports = (env) => {
  if (env === "build") {
    return merge(common, build);
  }

  return merge(common, dev);
};
