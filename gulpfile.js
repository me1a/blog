const fs = require('fs')

const { parallel, series, src, dest, watch } = require('gulp')

const browserSync = require('browser-sync').create()

const myplugin = require('./build/gulp-md2html')



function md2html() {
  return src('article/**/*.md').pipe(myplugin()).pipe(dest('dist/'))
}

function watchTask() {
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



exports.default = series(md2html, server, watchTask)