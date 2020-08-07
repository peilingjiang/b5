import postcss from 'gulp-postcss'
import pkg from 'gulp'

import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import precss from 'precss'
import assets from 'postcss-assets'
import scss from 'postcss-scss'
import postcssColorMod from 'postcss-color-mod-function'

const { task, src, dest, series } = pkg

task('css', () => {
  return src(['./src/**/*.css', '!./src/postcss/**/*.css'])
    .pipe(
      postcss(
        [
          // PostCSS plugins here
          assets({
            loadPaths: ['src/img/'],
          }),
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

task('default', series('css'))
