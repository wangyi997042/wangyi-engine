const path = require('path');
const gulp = require('gulp');

const DIR = {
  css: path.resolve(__dirname, '../../src/**/*.css'),
  lib: path.resolve(__dirname, '../../lib'),
};

gulp.task('copySass', () => {
  return gulp.src(DIR.css)
    .pipe(gulp.dest(DIR.lib));
});

gulp.task('default', ['copySass']);
