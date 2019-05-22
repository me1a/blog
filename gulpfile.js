const { parallel, series, src, dest, watch } = require('gulp')
const less = require('gulp-less')
const mincss = require('gulp-clean-css')
const browserSync = require('browser-sync').create()
const rm = require('rimraf')
const pug = require('gulp-pug')

const md2obj = require('./build/gulp-md2obj')
const obj2pug = require('./build/gulp-pug2html')





function doc2html() {
  return src('article/**/*.md').pipe(md2obj()).pipe(obj2pug(
    { template: process.cwd() + '/article/template.pug' }
  )).pipe(dest('dist/article'))
}
function less2css() {
  return src('less/*.less')
    .pipe(less({}))
    .pipe(mincss())
    .pipe(dest('dist/static/css/'))
}
function pug2html() {
  return src('pages/**/*.pug')
    .pipe(pug({
      locals: {}
    })).pipe(dest('dist'))
}






function clean(cb) {
  rm.sync('dist')
  cb()
}

function watchTask() {
  watch('less/**/*.less', parallel(less2css))
  watch('article/**/*.*', parallel(doc2html))
}
function server(cb) {
  browserSync.init({
    watch: true,
    port: 3434,
    server: {
      baseDir: "./dist/",
    },
    open: false
  })
  cb()
}



exports.default = series(clean, parallel(doc2html, less2css, pug2html), server, watchTask)
exports.build = series(clean, parallel(doc2html, less2css, pug2html))