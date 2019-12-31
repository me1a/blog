

const { parallel, series, src, dest, watch } = require('gulp')
const less = require('gulp-less')
const mincss = require('gulp-clean-css')
const browserSync = require('browser-sync').create()
const dirTree = require('directory-tree')
const pug = require('gulp-pug')

const md2obj = require('./build/gulp-md2obj')
const obj2pug = require('./build/gulp-pug2html')

const globs = {
  less: 'less/**/*.less',
  img: 'img/**/*.*',
  pug: ['pages/**/*.pug', 'components/**/*.pug'],
  markdown: 'docs/**/*.md'
}

let tree = []
let search = []
let last = []
let object = {}


function getTree() {

  tree = dirTree('docs', { extensions: /\.md$/ }, (item, v, stats) => {
    if (item.type === 'file') {
      item.path = item.path.slice(0, -3) + '.html'
      item.name = object[item.path]
      console.log(object)
    }
  }).children
}

function markdownTask(path) {
  return src(path).pipe(md2obj({
    visit(obj) {
      object[obj.url] = obj.title
      console.log(object)
    }
  })).pipe(obj2pug(
    { template: process.cwd() + '/components/docs-template.pug' }
  )).pipe(dest('dist/docs/'))
}


function imgTask(path) {
  return src(path).pipe(dest('dist/static/img'))
}

function lessTask(path) {
  return src(path).pipe(less({}))
    .pipe(mincss())
    .pipe(dest('dist/static/css/'))
}


function pugTask(path) {
  return src(path).pipe(pug({
    locals: {
      tree: tree,
      search: [],
      last: [],
      navbar: []
    }
  })).pipe(dest('dist'))
}


function watchTask(cb) {

  const watchMarkdown = watch(globs.markdown)
  watchMarkdown.on('change', markdownTask)
  watch(globs.pug, (path) => { console.log(path); pugTask(globs.pug) })
  watch(globs.img, () => { imgTask(globs.img) })
  watch(globs.less, () => { lessTask(globs.less) })
  cb()
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

function build(cb) {
  lessTask(globs.less)
  imgTask(globs.img)
  markdownTask(globs.markdown)
  getTree()
  pugTask(globs.pug)
  cb()
}



exports.default = series(server, watchTask, build)
exports.build = series(build)