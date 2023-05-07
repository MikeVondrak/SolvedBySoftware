const gulp = require("gulp");
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");
const browserSync = require("browser-sync").create();
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const tsProjectUtil = ts.createProject("tsconfig.json");

function sourceTranspile() {
  return gulp.src(['src/**/*.ts'])
    .pipe(tsProject())
    .pipe(gulp.dest('dist'));
}
function utilTranspile() {
  return gulp.src(['util/**/*.ts'])
    .pipe(tsProjectUtil())
    .pipe(gulp.dest('util/js'));
}

function copyHtml() {
  
  // NEED gulp inject to put templates into index

  return gulp.src(["index.html"]).pipe(gulp.dest("dist"));
}

function copyCss() {
  return (
    gulp
      .src(["src/css/reset.css", "src/css/*.css"])
      .pipe(concat("bundle.min.css"))
      .pipe(cleanCSS())
      //.pipe(uglify())
      .pipe(gulp.dest("dist/css"))
  );
}

function copyAssets() {
  return gulp.src("src/assets/**/*").pipe(gulp.dest("dist/assets"));
}

function copyFiles() {
  sourceTranspile();
  copyHtml();
  copyCss();
  copyAssets();
}

function refresh() {
  browserSync.reload();
}

function serve() {
  //utilTranspile();
  //copyFiles();



  browserSync.init({
    server: {
      baseDir: "./dist",
      middleware: function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        const fileType = req.url.split(".").pop();
        //console.log('FILETYPE', fileType);
        switch (fileType) {
          case "html":
            res.setHeader("Content-Type", "text/html");
            break;
          case "js":
            res.setHeader("Content-Type", "application/javascript");
            break;
          case "css":
            res.setHeader("Content-Type", "text/css");
            break;
        }
        next();
      },
    },
    port: 3001,
  });

  // Watch for changes to HTML, CSS, and JavaScript files
  gulp.watch(["./index.html"]).on("change", () => { console.log('Updating HTML'); refresh(); });
  gulp.watch(["./src/css/*.css"]).on("change", () => { console.log('Updating CSS'); refresh(); });
  gulp.watch(["./src/app/ts/*.ts"]).on("change", () => { console.log('Updating TS'); refresh(); });
  gulp.watch(["./src/assets/**/*"]).on("change", () => { console.log('Updating Assets'); refresh(); });
}

exports.copyFiles = copyFiles;
exports.serve = serve;

