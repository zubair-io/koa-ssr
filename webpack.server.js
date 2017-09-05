const fs = require('fs');
const path = require('path');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const postcssUrl = require('postcss-url');
const cssnano = require('cssnano');

const {
    NoEmitOnErrorsPlugin,
    SourceMapDevToolPlugin,
    NamedModulesPlugin,
} = require('webpack');
const {
    GlobCopyWebpackPlugin,
    BaseHrefWebpackPlugin,
} = require('@angular/cli/plugins/webpack');
const { CommonsChunkPlugin } = require('webpack').optimize;
const { AotPlugin } = require('@ngtools/webpack');

const nodeModules = path.join(process.cwd(), 'node_modules');
const realNodeModules = fs.realpathSync(nodeModules);
const genDirNodeModules = path.join(
    process.cwd(),
    'src',
    '$$_gendir',
    'node_modules',
);
const entryPoints = ['server'];
const minimizeCss = false;
const baseHref = '';
const deployUrl = '';
const postcssPlugins = function() {
    // safe settings based on: https://github.com/ben-eb/cssnano/issues/358#issuecomment-283696193
    const importantCommentRe = /@preserve|@license|[@#]\s*source(?:Mapping)?URL|^!/i;
    const minimizeOptions = {
        autoprefixer: false,
        safe: true,
        mergeLonghand: false,
        discardComments: {
            remove: comment => !importantCommentRe.test(comment),
        },
    };
    return [
        postcssUrl({
            url: URL => {
                // Only convert root relative URLs, which CSS-Loader won't process into require().
                if (!URL.startsWith('/') || URL.startsWith('//')) {
                    return URL;
                }
                if (deployUrl.match(/:\/\//)) {
                    // If deployUrl contains a scheme, ignore baseHref use deployUrl as is.
                    return `${deployUrl.replace(/\/$/, '')}${URL}`;
                } else if (baseHref.match(/:\/\//)) {
                    // If baseHref contains a scheme, include it as is.
                    return (
                        baseHref.replace(/\/$/, '') +
                        `/${deployUrl}/${URL}`.replace(/\/\/+/g, '/')
                    );
                } else {
                    // Join together base-href, deploy-url and the original URL.
                    // Also dedupe multiple slashes into single ones.
                    return `/${baseHref}/${deployUrl}/${URL}`.replace(
                        /\/\/+/g,
                        '/',
                    );
                }
            },
        }),
        autoprefixer(),
    ].concat(minimizeCss ? [cssnano(minimizeOptions)] : []);
};

module.exports = {
    target: 'node',
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ['./node_modules', './node_modules'],
        symlinks: true,
    },
    resolveLoader: {
        modules: ['./node_modules', './node_modules'],
    },
    entry: path.join(__dirname + '/src/server.ts'),
    output: {
        path: path.resolve(__dirname, './dist/server'),
        libraryTarget: 'commonjs2',
        filename: 'server.js',
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: [/\/node_modules\//],
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
            {
                test: /\.html$/,
                loader: 'raw-loader',
            },
            {
                test: /\.(eot|svg)$/,
                loader: 'file-loader?name=[name].[hash:20].[ext]',
            },
            {
                test: /\.(jpg|png|webp|gif|otf|ttf|woff|woff2|cur|ani)$/,
                loader: 'url-loader?name=[name].[hash:20].[ext]&limit=10000',
            },
            {
                exclude: [path.join(process.cwd(), 'src/styles.css')],
                test: /\.css$/,
                use: [
                    'exports-loader?module.exports.toString()',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: postcssPlugins,
                        },
                    },
                ],
            },
            {
                exclude: [path.join(process.cwd(), 'src/styles.css')],
                test: /\.scss$|\.sass$/,
                use: [
                    'exports-loader?module.exports.toString()',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: postcssPlugins,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: false,
                            precision: 8,
                            includePaths: [],
                        },
                    },
                ],
            },
            {
                exclude: [path.join(process.cwd(), 'src/styles.css')],
                test: /\.less$/,
                use: [
                    'exports-loader?module.exports.toString()',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: postcssPlugins,
                        },
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: false,
                        },
                    },
                ],
            },
            {
                exclude: [path.join(process.cwd(), 'src/styles.css')],
                test: /\.styl$/,
                use: [
                    'exports-loader?module.exports.toString()',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: postcssPlugins,
                        },
                    },
                    {
                        loader: 'stylus-loader',
                        options: {
                            sourceMap: false,
                            paths: [],
                        },
                    },
                ],
            },
            {
                include: [path.join(process.cwd(), 'src/styles.css')],
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: postcssPlugins,
                        },
                    },
                ],
            },
            {
                include: [path.join(process.cwd(), 'src/styles.css')],
                test: /\.scss$|\.sass$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: postcssPlugins,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: false,
                            precision: 8,
                            includePaths: [],
                        },
                    },
                ],
            },
            {
                include: [path.join(process.cwd(), 'src/styles.css')],
                test: /\.less$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: postcssPlugins,
                        },
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: false,
                        },
                    },
                ],
            },
            {
                include: [path.join(process.cwd(), 'src/styles.css')],
                test: /\.styl$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: postcssPlugins,
                        },
                    },
                    {
                        loader: 'stylus-loader',
                        options: {
                            sourceMap: false,
                            paths: [],
                        },
                    },
                ],
            },
            {
                test: /\.ts$/,
                loader: '@ngtools/webpack',
            },
        ],
    },
    plugins: [
        new NoEmitOnErrorsPlugin(),
        new ProgressPlugin(),
        new SourceMapDevToolPlugin({
            filename: '[file].map[query]',
            moduleFilenameTemplate: '[resource-path]',
            fallbackModuleFilenameTemplate: '[resource-path]?[hash]',
            sourceRoot: 'webpack:///',
        }),
        new BaseHrefWebpackPlugin({}),
        new NamedModulesPlugin({}),
        new AotPlugin({
            tsConfigPath: 'tsconfig.json',
            skipCodeGeneration: false,
            entryModule: path.join(
                __dirname + '/src/app/app.node.module#AppNodeModule',
            ),
        }),
    ],
    node: {
        global: false,
        __dirname: false,
        __filename: false,
        process: false,
        Buffer: false,
        clearImmediate: false,
        setImmediate: false,
    },
    devServer: {
        historyApiFallback: true,
    },
};
