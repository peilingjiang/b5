import postcss from 'gulp-postcss'
import pkg from 'gulp'
import { deleteAsync } from 'del'

import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import precss from 'precss'
import scss from 'postcss-scss'
import postcssColorMod from 'postcss-color-mod-function'

// const postcss = require('gulp-postcss')
// const pkg = require('gulp')
// const del = require('del')

// const autoprefixer = require('autoprefixer')
// const cssnano = require('cssnano')
// const precss = require('precss')
// const scss = require('postcss-scss')
// const postcssColorMod = require('postcss-color-mod-function')

const { task, src, dest, series, watch } = pkg

/* PostCSS */

task('clean', function () {
  return deleteAsync(['./src/postcss/**'])
})

task('css', function () {
  console.log('Building PostCSS...')
  return src(['./src/**/*.css', '!./src/postcss/**/*.css', '!./src/b5.js/**/*'])
    .pipe(
      postcss(
        [
          // PostCSS plugins here
          precss(),
          postcssColorMod(),
          autoprefixer(),
          cssnano(),
        ],
        {
          syntax: scss,
        }
      )
    )
    .pipe(dest('./src/postcss'))
})

task('watch', function () {
  task('css')()
  return watch(
    ['./src/**/*.css', '!./src/postcss/**/*.css', '!./src/b5.js/**/*'],
    series('css')
  )
})

task(
  'default',
  series('clean', process.env.NODE_ENV === 'development' ? 'watch' : 'css')
)
