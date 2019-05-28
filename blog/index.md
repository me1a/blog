---
author: meihuan
date: 2019-5-26
---



# 打造一个的静态文档网站

## `markdown` 介绍

在 `wikipedia` 中， `markdown` 描述为:
> Markdown是一种轻量级标记语言, 它允许人们“使用易读易写的纯文本格式编写文档，然后转换成有效的XHTML（或者HTML）文档”

`markdown` 的特点是 **轻量化**、**易读易写**。我们现在要将 `markdown` 转化为 `html`。选型上选择了 [unified](!https://unified.js.org/):

> unified is an interface for processing text with syntax trees and transforming between them.
>
> **unified是一个用语法树处理文本并在它们之间进行转换的接口。**

现进行准备工作，安装需要的npm包。

```
npm i unified to-vfile vfile-reporter remark-parse remark-toc remark-rehype rehype-document rehype-stringify -S
```

创建一个 `markdown` 文件, 运行以下代码（demo），可以将 `markdown` 生成 `html`,

```js
var unified = require('unified')
var vfile = require('to-vfile')
var report = require('vfile-reporter')
var markdown = require('remark-parse')
var toc = require('remark-toc')
var remark2rehype = require('remark-rehype')
var doc = require('rehype-document')
var html = require('rehype-stringify')

var processor = unified()
   .use(markdown)
   .use(toc)
   .use(remark2rehype)
   .use(doc, {title: 'Contents'})
   .use(html)


processor.process(vfile.readSync('article.md'), function(err, file) {
  if (err) throw err
  console.error(report(file))
  file.extname = '.html'
  vfile.writeSync(file)
})

```

实际上，`markdown` ，`html` 这样的语言，`javascript` 对他们的处理方式都是相似的， 都是将他们处理成为一个对象，而这个对象会根据他们本身的结构来展现，通常来说是一棵树, 在 `react` 中, 虚拟 dom 就是用来描述 `html` 树的， 类似的，如果有以下 `markdown` 代码：

```markdown
# 一级标题

这是描述
```

[unified](!https://unified.js.org/) 会生成以下树结构对象（简化过）：

```js
{ type: 'root',
  children:
   [
     { type: 'heading',
       depth: 1,
       children: [ { type: 'text', value: '一级标题', position: [Object] } ],
       position:
        { start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 7, offset: 6 },
          indent: [] } },
     { type: 'paragraph',
       children: [ { type: 'text', value: '这是描述', position: [Object] } ],
       position:
        { start: { line: 3, column: 1, offset: 8 },
          end: { line: 3, column: 5, offset: 12 },
          indent: [] } }
  ],
  position:
   { start: { line: 1, column: 1, offset: 0 },
     end: { line: 3, column: 5, offset: 12 } } }
```

在 [unified](!https://unified.js.org/) 生态中，通过各种插件， 逐步处理这棵树，最终生成我们想要的结果。


## 思路整理

在选型上，博客是主要功能 **记录自己** 和  **展现他人**，所以简单、快是一个重要的指标。

前端上，技术栈上使用三大框架（`React`, `Vue`, `Angular`）似乎有些小题大作，而且速度和简单性没有纯HTML来的直接。
后端上，如果将文档存储于数据库， 不管是服务端渲染或客户端渲染都有一些局限性，客户端渲染首屏慢，且不能缓存。服务端渲染扩展性不高。
另一方面，现开发者大都是使用 `markdown` 来书写博客，直接用`markdown`文件代替数据库存储是一个不错的选择。
考虑到通用性（可发布到各大开发者网站）， 使用简单的 `markdown`（里面不应包含三大框架的组件,如 `mdx` ）是一个不错的选择。


同时,使用 [pug](https://pugjs.org/api/getting-started.html) 模板引擎能简单，快速的做一个静态网站，比如首页，关于我们页面。另外，他的模块化，继承，Mixin 等功能能很大程度的简化我们的开发工作。

一般文档具有可搜索，目录，最近更新等功能。本项目是纯粹的静态站点，即需要node在构建的时候获取了相关信息。

比如可搜索功能，在文档构建过程中， 我们获取每篇文档的标题字段，将得到的数组传入相应的页面。该页面即可进行对文章标题的搜索。
目录，最近更新等功能也如此 -- 即所有复杂，耗时的功能，都放在构建的时候。 而用户访问的时候，服务器仅仅把 `html` 传给客户端即可。 如果有缓存，那会更快， 直接从浏览器拿缓存就可以了。

最后， 我们通过发布工具，把构建的 dist 目录所有文件发布到服务器，就实现了一个文档展示的静态网站。


## 使用 `gulp` 自动化构建工具来准备构建工作

首先希望 `gulp`，能提供一个web服务来展现 `markdown` 生成的文档， 并且， 我希望更新 `markdown` 的时候能自动刷新浏览器。

我们来看，基本功能的 `gulpfile.js` 如下代码，

``` js

const { parallel, series, src, dest, watch } = require('gulp')
const less = require('gulp-less')
const mincss = require('gulp-clean-css')
const browserSync = require('browser-sync').create()
const rm = require('rimraf')
const pug = require('gulp-pug')

const md2obj = require('./build/gulp-md2obj')
const obj2pug = require('./build/gulp-pug2html')

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
exports.default = series(clean, parallel(doc2html, less2css, pug2html), server, watchTask)
exports.build = series(clean, parallel(doc2html, less2css, pug2html))

```

`doc2html`：将文档目录 /blog 里面的 `markdown` 转化为 `Object` 对象，再将该对象作为参数传入 [pug](https://pugjs.org/api/getting-started.html) 模板引擎，最终渲染出完整的 html。

`less2css`：将样式文件转化压缩到指定的位置。

`pug2html`：不同于 `doc2html`，源头是 `markdown` 文件。此函数将 `pug` 文档直接输出为 `html` 。比如首页，关于我直接的页面。

`clean`：清空 /dist 目录。

`watchTask`： 监听函数。文件变动执行相应的任务。

`server`： 开启开发服务器和文件变动自动刷新浏览器都在此函数内。

在本项目中， 需要自己写一个 `gulp` 插件。具体可参考 [writing a plugin](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md)。


## 实现细节

### mac 窗口的代码样式

`unified` 会将 `markdown` 文档处理一颗虚拟树，首先找到子元素为 `code` 的 `pre` 元素。

```js
const tree = [
  { type: 'text', value: '\n' },
  { type: 'element',
    tagName: 'pre',
    properties: {},
    children:
    [
      { type: 'element',
        tagName: 'code',
        properties: {},
        children: [Array],
        position: [Object] }
    ],
    position: [Object]},
  { type: 'text', value: '\n' },
  ...
]
```

对每个这样的 `pre` 元素外面套一层元素和加三个兄弟节点。就可以实现类似 `mac` 窗口效果。

实现代码在 ***/build/md/addMacWindow.js***

### FrontMatter

> FrontMatter: 是文件最上方以 --- 分隔的区域，用于指定个别文件的变量。

在 [hexo](https://hexo.io/zh-cn/docs/front-matter.html) 中这么描述`FrontMatter`, 本项目中借助包 `remark-frontmatter` 将 FrontMatter 抽象成一个 `type` 为 `yaml` 的节点, 它的 value 就是你写的数据的字符串形式, 将 value解析出就可以了， 这里做了键值对中值为对象的兼容。



```js
const visit = require('unist-util-visit')
module.exports = function getFrontMatter() {
  return function transformer(tree, data) {
    visit(tree, 'yaml', function (node) {
      const obj = {}
      const arr = node.value.split('\n')
      arr.forEach(item => {
        const i = item.indexOf(':')
        const k = item.slice(0, i).trim()
        const v = item.slice(i + 1).trim()

        if ((/\{.*\}/.test(v) || /\[.*\]/.test(v))) {
          const val = new Function(`return ${v}`)()
          obj[k] = val
        } else {
          obj[k] = v
        }
      })
      data.data = { ...obj }
    })
  }
}
```

解析出来的值可以结合 `pug` 直接用， 本文档中， 文档开头的作者，日期就是来源于 `FrontMatter`

```md

---
author: meihuan
date: 2019-5-26
---

# 打造一个的静态网站
```


## 目录结构


`/blog`: 文档写在该目录， 构建的时候会根据该目录结构生成相应的html。

`/build`: 构建相关， 其中， `/md` 是处理 `markdown` 的相关代码。 是 `unified` 的插件。`gulp` 开头的文件是 `gulp` 插件。 `publish.js` 是部署相关功能， 其中引用前同事写的包 [fjpublish](http://fjpublish.manman.io/) 。

`/components`： 通用组件或 `Layout` 相关代码。

`/dist`：为发布目录。

`/img`、`/less`、`/pages` 分别为项目图片，样式，页面相关代码。