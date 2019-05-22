const fs = require('fs')

const { parallel, series, src, dest, watch } = require('gulp')
const less = require('gulp-less')
const mincss = require('gulp-clean-css')
const browserSync = require('browser-sync').create()
const rm = require('rimraf')
const pug = require('gulp-pug')

const md2obj = require('./build/gulp-md2obj')
const obj2pug = require('./build/gulp-pug2html')

const dirTree = require("directory-tree")



function doc2html() {
  return src('blog/**/*.md').pipe(md2obj()).pipe(obj2pug(
    { template: process.cwd() + '/blog/template.pug' }
  )).pipe(dest('dist/blog/'))
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
  watch('blog/**/*.*', parallel(doc2html))
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

function getMDTree(cb) {
  rm.sync('dist/contents.js')
  const tree = dirTree('dist/blog', { extensions: /\.html/, attributes: ['title', 'url'] }, (item, path, stats) => {
    item.url = item.path.slice(4)
    item.title = item.name.slice(0, -5)
  })
  fs.writeFileSync('dist/contents.js', '_CONTENTS_DATA=' + JSON.stringify(tree.children))
  cb()
}




exports.default = series(clean, parallel(doc2html, less2css, pug2html), getMDTree, server, watchTask)
exports.build = series(clean, parallel(doc2html, less2css, pug2html), getMDTree)