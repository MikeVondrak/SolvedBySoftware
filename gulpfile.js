const fs = require("fs");
const gulp = require("gulp");
const connect = require("gulp-connect");
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");
const ts = require("gulp-typescript");
const order = require("gulp-order");
const uglify = require("gulp-uglify");
const inject = require("gulp-inject");
const replace = require("gulp-replace");
const map = require("map-stream");
const sass = require("gulp-sass")(require("sass"));
const tsProject = ts.createProject("tsconfig.json");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const htmlFilesPath = "./src/app/html/";

gulp.task("bundleCss", function () {
  const scssFiles = "src/app/scss/**/*.scss";
  return gulp
    .src(scssFiles)
    .pipe(order(["reset.scss", "styles.scss", "*.scss"]))
    .pipe(sass().on("error", sass.logError))
    .pipe(concat("bundle.css"))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./dist/css"))
    .pipe(connect.reload());
});

gulp.task("typescript", function () {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(concat("bundle.js"))
    .pipe(uglify())
    .pipe(gulp.dest("./dist/js"))
    .pipe(connect.reload());
});

gulp.task("html", function () {
  console.log('HTML');

  // Iterate through HTML files and get template ID from element
  const templateFiles = fs
    .readdirSync(htmlFilesPath)
    .map((f) => htmlFilesPath + f);
  let templateContents = new Map();
  templateFiles.forEach((file) => {
    
    console.log('LOADING HTML', templateFiles.length);
    
    const fileTemplate = fs.readFileSync(file);
    if (fileTemplate) {
      const domTemplate = new JSDOM(fileTemplate);
      const docTemplate = domTemplate?.window?.document;
      const template = docTemplate?.querySelector("template");
      if (!!template) {
        const attr = template.attributes.getNamedItem("data-template-id");
        const templateId = attr.value;
        templateContents.set(templateId, template.innerHTML);
      }
    }
  });

  // Return modified index.html file contents
  return gulp.src("./index.html").pipe(
    map(function (file, callback) {
      const contents = file?.contents?.toString();
      const name = file.basename;
      const domIndex = new JSDOM(contents);
      const docIndex = domIndex?.window?.document;

      console.log('REFRESHING INDEX', templateContents.size);

      // iterate through templates and insert into index.html
      templateContents.forEach((val, key) => {
        const selector = `[data-content-id="${key}"]`;
        const placeholderList = docIndex.querySelectorAll(`${selector}`);
        const placeholders = Array.from(placeholderList);
        // if there's a placeholder with a data-content-id that matches an html file's data-template-id
        if (placeholders.length > 0) {
          // assume we matched exactly 1 element
          placeholders[0].append(JSDOM.fragment(val));
        }
      });

      const newContents = Buffer.from(docIndex.documentElement.outerHTML);
      file.contents = newContents;
      callback(null, file);
    })).pipe(gulp.dest("dist")).pipe(connect.reload());
});

gulp.task("copyAssets", function () {
  gulp.src("./favicon.*").pipe(gulp.dest("./dist"));
  return gulp.src("src/assets/**/*").pipe(gulp.dest("dist/assets"));
});

gulp.task("reloadIndex", function () {
  console.log('RELOAD');
  return connect.reload(); // TODO - this doesn't work
});

gulp.task("serve", function () {
  connect.server({
    root: "./dist",
    livereload: true,
    port: 3000,
  });

  // gulp
  //   .watch("./src/app/scss/*.scss")
  //   .on("change", gulp.series("bundleCss", "refresh"));
  // gulp
  //   .watch("./src/app/ts/*.ts")
  //   .on("change", gulp.series("typescript", "refresh"));
  // gulp.watch("./index.html").on("change", gulp.series("html", "refresh"));
  // gulp.watch("./src/app/html/*.html").on("change", gulp.series("html", "refresh"));


  gulp.watch("./src/app/scss/*.scss").on("change", gulp.series("bundleCss"));
  gulp.watch("./src/app/ts/*.ts").on("change", gulp.series("typescript"));
  gulp.watch("./index.html").on("change", gulp.series("html"));
  gulp.watch("./src/app/html/*.html").on("change", gulp.series("html"));

});

gulp.task(
  "default",
  gulp.series("copyAssets", "bundleCss", "typescript", "html", "serve")
);
