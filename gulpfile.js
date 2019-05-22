const { parallel, series, src, dest, watch } = require('gulp')

const browserSync = require('browser-sync').create()

const md2obj = require('./build/gulp-md2obj')
const pug2html = require('./build/gulp-pug2html')

const less = require('gulp-less')
const mincss = require('gulp-clean-css')



function doc2html() {
  return src('article/**/*.md').pipe(md2obj()).pipe(pug2html(
    { template: process.cwd() + '/article/template.pug' }
  )).pipe(dest('dist/'))
}
function less2css() {
  return src('less/*.less')
    .pipe(less({}))
    .pipe(mincss())
    .pipe(dest('dist/static/css/'))
}

function watchTask() {
  watch('less/**/*.less', parallel(less2css))
  watch('article/**/*.md', parallel(doc2html))
}


function server(cb) {
  browserSync.init({
    watch: true,
    port: 3434,
    server: {
      baseDir: "./dist/",
    }
  })
  cb()
}



exports.default = series(parallel(doc2html, less2css), server, watchTask)
exports.build = parallel(doc2html, less2css)