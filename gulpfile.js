const gulp = require("gulp");
const connect = require("gulp-connect");
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");
const ts = require("gulp-typescript");
const order = require('gulp-order');
const sass = require("gulp-sass")(require("sass"));
const tsProject = ts.createProject("tsconfig.json");

gulp.task("bundleCss", function () {
  const scssFiles = 'src/app/scss/**/*.scss';
  return gulp.src(scssFiles)
    .pipe(order(['reset.scss', 'styles.scss', '*.scss']))
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('bundle.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./dist/css'))
});

gulp.task("typescript", function () {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest("./dist/js"))
});

gulp.task("html", function () {
  return gulp.src('./index.html')
    .pipe(gulp.dest('./dist'))
});

gulp.task("copyAssets", function () {
  gulp.src("./favicon.*").pipe(gulp.dest("dist"));
  return gulp.src("src/assets/**/*")
    .pipe(gulp.dest("dist/assets"));
});

gulp.task('refresh', function () {
  return gulp.src('./index.html').pipe(connect.reload());
});

gulp.task("serve", function () {
  connect.server({
    root: './dist',
    livereload: true,
    port: 3000,
  });

  gulp.watch("./src/app/scss/*.scss").on("change", gulp.series("bundleCss", "refresh"));
  gulp.watch("./src/app/ts/*.ts").on("change", gulp.series("typescript"));
  gulp.watch("./index.html").on("change", gulp.series("html", "refresh"));
});

gulp.task("default", gulp.series("copyAssets", "bundleCss", "typescript", "html", "serve"));
