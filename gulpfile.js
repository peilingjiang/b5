let postcss = require('gulp-postcss'),
  gulp = require('gulp'),
  autoprefixer = require('autoprefixer'),
  cssnano = require('cssnano')

gulp.task('css', () => {
  let plugin = [
    // PostCSS plugins here
    autoprefixer(),
    cssnano(),
  ]
  return gulp
    .src(['./src/**/*.css', '!./src/postcss/**/*.css'])
    .pipe(postcss(plugin))
    .pipe(gulp.dest('./src/postcss'))
})

gulp.task('default', gulp.series('css'))
