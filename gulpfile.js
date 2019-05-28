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


let tree
let search = []
let last = []


function doc2html() {
  return src('blog/**/*.md').pipe(md2obj({
    visit(d) {
      if (!search.some(item => item.title === d._name && item.url === d._url)) {
        d._search.forEach(i => {
          search.push({
            url: d._url,
            title: i,
            name: d._name
          })
        })
        search.push({
          title: d._name,
          url: d._url
        })
      }
      if (!last.some(item => item.name === d._name && item.url === d._url)) {
        last.push({
          url: d._url,
          name: d._name,
          updateTime: d._updateTime,
          des: d._description
        })
      }



    }
  })).pipe(obj2pug(
    { template: process.cwd() + '/components/blog-template.pug' }
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
      locals: {
        tree,
        search,
        last: last
      }
    })).pipe(dest('dist'))
}
function copyimg() {
  return src('img/**/*.*').pipe(dest('dist/static/img'))
}






function clean(cb) {
  rm.sync('dist')
  cb()
}

function watchTask() {
  watch('less/**/*.less', parallel(less2css))
  watch(['pages/**/*.pug', 'components/**/*.pug'], parallel(pug2html))
  watch(['blog/**/*.md', 'components/**/*.pug'], parallel(doc2html))
  watch('dist/blog/**/**.html', getMDTree)
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

  const t = dirTree('dist/blog', { extensions: /\.html/, attributes: ['title', 'url'] }, (item, path, stats) => {
    item.url = item.path.slice(4)
    item.title = item.name.slice(0, -5)
  })
  tree = t.children
  cb()
}




exports.default = series(clean, parallel(doc2html, less2css, copyimg), getMDTree, pug2html, server, watchTask)
exports.build = series(clean, parallel(doc2html, less2css, copyimg), getMDTree, pug2html)