import postcss from 'gulp-postcss'
import pkg from 'gulp'
import del from 'del'

import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import precss from 'precss'
import scss from 'postcss-scss'
import postcssColorMod from 'postcss-color-mod-function'

const { task, src, dest, series, watch } = pkg

/* PostCSS */

task('clean', function () {
  return del(['./src/postcss/**'])
})

task('css', function () {
  console.log('Building PostCSS...')
  return src(['./src/**/*.css', '!./src/postcss/**/*.css'])
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
  return watch(['./src/**/*.css', '!./src/postcss/**/*.css'], series('css'))
})

task(
  'default',
  series('clean', process.env.NODE_ENV === 'development' ? 'watch' : 'css')
)
