

const { parallel, series, src, dest, watch, task } = require('gulp')
const less = require('gulp-less')
const mincss = require('gulp-clean-css')
const browserSync = require('browser-sync').create()
const dirTree = require('directory-tree')
const pug = require('gulp-pug')

const md2obj = require('./build/gulp-md2obj')
const pug2html = require('./build/gulp-pug2html')
const { navbar, lastArticleCount } = require('./config.js')

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


function getTree(cb) {
  tree = dirTree('docs', { extensions: /\.md$/ }, (item, v, stats) => {
    if (item.type === 'file') {
      item.path = item.path.slice(0, -3) + '.html'
      item.name = object[`/${item.path}`]
    }
  }).children
  cb()
}

function markdownTask(path) {
  return function () {
    return src(path).pipe(md2obj({
      visit(obj) {
        const { title, createTime, url, description } = obj
        object[url] = title
        const date = new Date(createTime)
        const data = {
          url: url,
          name: title,
          t: date.getTime(),
          createTime: date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
          des: description,
        }
        if (!last.some(item => item.url === url)) {
          last.push(data)
          last = last.sort((a, b) => a.t < b.t ? 1 : -1).slice(0, lastArticleCount)
        }

      }
    })).pipe(pug2html(
      { template: process.cwd() + '/components/docs-template.pug' }
    )).pipe(dest('dist/docs/'))
  }
}


function imgTask(path) {
  return function () {
    return src(path).pipe(dest('dist/static/img'))
  }
}

function lessTask(path) {
  return function () {
    return src(path).pipe(less({}))
      .pipe(mincss())
      .pipe(dest('dist/static/css/'))
  }
}


function pugTask(path) {
  return function () {
    return src(path).pipe(pug({
      locals: {
        tree: tree,
        search: search,
        last: last,
        navbar
      }
    })).pipe(dest('dist'))
  }
}


function watchTask(cb) {

  const watchMarkdown = watch(globs.markdown)
  watchMarkdown.on('change', path => markdownTask(path)())
  watch(globs.pug, pugTask(globs.pug))
  watch(globs.img, imgTask(globs.img))
  watch(globs.less, lessTask(globs.less))
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



exports.build = exports.default = parallel(
  server,
  watchTask,
  lessTask(globs.less),
  imgTask(globs.img),
  series(
    markdownTask(globs.markdown),
    getTree,
    pugTask(globs.pug)
  )
)