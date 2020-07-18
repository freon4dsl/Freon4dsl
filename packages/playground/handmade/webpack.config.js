var webpack = require("webpack");
var path = require("path");

var isProduction = process.argv.indexOf("-p") >= 0;
var sourcePath = path.join(__dirname, "./src");
var outPath = path.join(__dirname, "./dist");

// plugins
var HtmlWebpackPlugin = require("html-webpack-plugin");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "development",
    context: sourcePath,
    entry: {
        main: "./run.ts"
    },
    output: {
        path: outPath,
        filename: "[unitName].js",
        publicPath: "/"
    },
    target: "web",
    resolve: {
        extensions: [".webpack.js", ".web.js", ".js", ".ts", ".tsx", ".json", ".scss", ".css"],
        alias: {
            "@projectit/core": path.join(__dirname, "../core/src"),
            "@projectit/demo": path.join(__dirname, "./src"),
            "@projectit/meta": path.join(__dirname, "../meta/src")
        }
        // Fix webpack's default behavior to not load packages with jsnext:main module
        // (jsnext:main directs not usually distributable es6 format, but es6 sources)
        // mainFields: ['module', 'browser', 'main']
    },

    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    minChunks: 12,
                    chunks: "initial",
                    name: "vendor",
                    enforce: true
                }
            }
        }
    },

    module: {
        rules: [
            // .ts, .tsx
            {
                test: /\.ts(x?)$/,
                use: isProduction
                    ? "awesome-typescript-loader"
                    : [
                        "react-hot-loader/webpack",
                        "awesome-typescript-loader"
                    ]
            },
            // scss
            {
                test: /\.scss$/,
                use: [
                    { loader: "style-loader" },
                    {
                        loader: "css-loader",
                        options: {
                            modules: true
                        }
                    },
                    {
                        loader: "sass-loader"
                    }
                ],
                exclude: /\.iframe\.scss$/
            },

            // css
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            // static assets
            { test: /\.html$/, use: "html-loader" },
            { test: /\.png$/, use: "url-loader?limit=10000" },
            { test: /\.eot$/, use: "url-loader?limit=10000" },
            { test: /\.svg$/, use: "url-loader?limit=10000" },
            { test: /\.ttf$/, use: "url-loader?limit=10000" },
            { test: /\.woff2?$/, use: "url-loader?limit=10000" },
            { test: /\.gif$/, use: "url-loader?limit=10000" },
            { test: /\.jpg$/, use: "file-loader" }
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                context: sourcePath
            }
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
        new HtmlWebpackPlugin({
            template: "application/assets/index.html"
        })
    ],
    devServer: {
        contentBase: sourcePath,
        hot: true,
        stats: {
            warnings: false
        }
    },
    node: {
        // workaround for webpack-dev-server issue
        // https://github.com/webpack/webpack-dev-server/issues/60#issuecomment-103411179
        fs: "empty",
        net: "empty"
    }
};
