const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();

function copyCss() {
  return gulp.src(['src/css/reset.css', 'src/css/*.css'])
    .pipe(concat('bundle.min.css'))
    .pipe(cleanCSS())
    //.pipe(uglify())
    .pipe(gulp.dest('dist/css'));
}

function copyAssets() {
  return gulp.src('src/assets/**/*')
    .pipe(gulp.dest('dist/assets'));
}

function refresh() {
  console.log('REFRESHING');
  copyCss();
  copyAssets();
  browserSync.reload;
}

function serve() {
  browserSync.init({
    server: {
      baseDir: './'
    },
    port: 3001
  });

  // Watch for changes to HTML, CSS, and JavaScript files
  gulp.watch(['./index.html', './src/app/html/*.html', './src/css/*.css', './src/app/js/*.js']).on('change', () => { refresh() });
}

exports.copyAssets = copyAssets;
exports.serve = serve;