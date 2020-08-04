import postcss from 'gulp-postcss'
import pkg from 'gulp'

import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import precss from 'precss'

const { task, src, dest, series } = pkg

task('css', () => {
  return src(['./src/**/*.css', '!./src/postcss/**/*.css'])
    .pipe(
      postcss([
        // PostCSS plugins here
        precss(),
        autoprefixer(),
        cssnano(),
      ])
    )
    .pipe(dest('./src/postcss'))
})

task('default', series('css'))
