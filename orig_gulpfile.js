const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const watch = require('gulp-watch');

function css() {
  return gulp.src(['src/css/reset.css', 'src/css/*.css'])
    .pipe(concat('bundle.min.css'))
    .pipe(cleanCSS())
    //.pipe(uglify())
    .pipe(gulp.dest('dist/css'));
}

exports.css = css;

function watchFiles() {
  watch('src/css/*.css', css);
}

exports.watch = watchFiles;