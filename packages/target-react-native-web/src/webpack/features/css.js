/* eslint-disable immutable/no-mutation, global-require, no-new-require, new-cap */
import autoprefixer from 'autoprefixer'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
// Note: defined here because it will be used more than once.
const cssFilename = 'static/css/[name].[contenthash:8].css'

// Making sure that the publicPath goes back to to build folder.
const extractTextPluginOptions = {
  publicPath: Array(cssFilename.split('/').length).join('../')
}

const extractedLoader = ExtractTextPlugin.extract({
  fallback: require.resolve('style-loader'),
  use: [
    {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 1,
        minimize: true,
        sourceMap: true
      }
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebookincubator/create-react-app/issues/2677
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          autoprefixer({
            browsers: [
              '>1%',
              'last 4 versions',
              'Firefox ESR',
              'not ie < 9' // React doesn't support IE8 anyway
            ],
            flexbox: 'no-2009'
          })
        ]
      }
    }
  ],
  ...extractTextPluginOptions
})
// The notation here is somewhat confusing.
// "postcss" loader applies autoprefixer to our CSS.
// "css" loader resolves paths in CSS and adds assets as dependencies.
// "style" loader normally turns CSS into JS modules injecting <style>,
// but unlike in development configuration, we do something different.
// `ExtractTextPlugin` first applies the "postcss" and "css" loaders
// (second argument), then grabs the result CSS and puts it into a
// separate file in our build process. This way we actually ship
// a single CSS file in production instead of JS code injecting <style>
// tags. If you use code splitting, however, any async bundles will still
// use the "style" loader inside the async code so CSS from them won't be
// in the main CSS file.
export const rules = {
  test: /\.(css|scss|sass)/,
  loader: extractedLoader
  // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
}

export const plugins = () => [
  new ExtractTextPlugin({
    filename: cssFilename
  })
]
