const { parallel, series, src, dest, watch } = require('gulp')

const browserSync = require('browser-sync').create()

const myplugin = require('./build/gulp-md2html')

const less = require('gulp-less')
const mincss = require('gulp-clean-css')



function md2html() {
  return src('article/**/*.md').pipe(myplugin()).pipe(dest('dist/'))
}
function less2css() {
  return src('less/*.less')
    .pipe(less({}))
    .pipe(mincss())
    .pipe(dest('dist/static/css/'))
}

function watchTask() {
  watch('less/**/*.less', parallel(less2css))
  watch('article/**/*.md', parallel(md2html))
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



exports.default = series(parallel(md2html, less2css), server, watchTask)