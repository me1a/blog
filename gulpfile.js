

const { parallel, series, src, dest, watch } = require('gulp')
const less = require('gulp-less')
const miniCss = require('gulp-clean-css')
const browserSync = require('browser-sync').create()
const dirTree = require('directory-tree')
const pug = require('gulp-pug')

const md2obj = require('./build/gulp-markdown-to-html')
const { navbar, lastArticleCount } = require('./config.js')

const globs = {
  less: 'less/**/*.less',
  img: 'img/**/*.*',
  pug: 'pages/**/*.pug',
  component: 'components/**/*.pug',
  template: 'components/docs-template.pug',
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

function visit(obj) {
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
  if (!search.some(i => obj.search.some(j => i.title === j.value) && i.url === url)) {
    obj.search.forEach(item => {
      search.push({ title: item.value, url, type: item.type })
    })
  }
}

function markdownTask(path) {
  return function () {
    return src(path).pipe(md2obj({
      visit,
      template: globs.template
    })).pipe(dest('dist/docs/'))
  }
}


function imgTask() {
  return src(globs.img).pipe(dest('dist/static/img'))
}

function lessTask() {
  return src(globs.less).pipe(less({}))
    .pipe(miniCss())
    .pipe(dest('dist/static/css/'))
}


function pugTask() {
  return src(globs.pug).pipe(pug({
    locals: {
      tree: tree,
      search: search,
      last: last,
      navbar
    }
  })).pipe(dest('dist'))
}


function watchTask(cb) {
  watch([globs.markdown, globs.template], markdownTask(globs.markdown))
  watch([globs.pug, globs.component], pugTask)
  watch(globs.img, imgTask)
  watch(globs.less, lessTask)
  cb()
}
function server(cb) {
  browserSync.init({
    watch: true,
    port: 3434,
    server: {
      baseDir: './dist/',
    },
    open: false
  }, cb)
}



exports.default = parallel(
  lessTask,
  imgTask,
  series(
    markdownTask(globs.markdown),
    getTree,
    pugTask
  ),
  server,
  watchTask,
)

exports.build = parallel(
  lessTask,
  imgTask,
  series(
    markdownTask(globs.markdown),
    getTree,
    pugTask
  )
)