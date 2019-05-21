# 打造一个的静态网站

## toc

博客记录自己的成长轨迹，是非常有必要的，鉴于工作近三年，有必要搭建一个博客系统。 一来不给自己逃避记录的理由， 二来想了解下这方面的技术。

在选型上，考虑博客是主要功能 **记录自己** 和  **展现他人**，所以简单、快是一个重要的指标，加上三大框架（`React`, `Vue`, `Angular`）似乎有些小题大作，而且速度和简单性没有纯HTML来的直接，另一方面，现开发者大都是使用 `markdown` 来书写博客，考虑到通用性（可发布到各大开发者网站），里面不应包含三大框架的组件，由此，得到了最直接的描述： **写`markdown`，渲染成`HTML`**。

## 将 `markdown` 渲染成 `html`

在 `wikipedia` 中， `markdown` 描述为:
> Markdown是一种轻量级标记语言, 它允许人们“使用易读易写的纯文本格式编写文档，然后转换成有效的XHTML（或者HTML）文档”

`markdown` 的特点是 **轻量化**、**易读易写**。我们现在要将 `markdown` 转化为 `html`。选型上选择了 [unified](!https://unified.js.org/):

> unified is an interface for processing text with syntax trees and transforming between them. <br/>
> unified是一个用语法树处理文本并在它们之间进行转换的接口。

现进行准备工作，安装需要的npm包。

```shell
npm i unified to-vfile vfile-reporter remark-parse remark-toc remark-rehype rehype-document rehype-stringify -S
```

创建一个 `markdown` 文件, 运行以下代码，可以将 `markdown` 生成 `html`,

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

## 使用 `gulp` 自动化构建工具来准备构建工作

首先希望 `gulp`，能提供一个web服务来展现 `markdown` 生成的文档， 并且， 我希望更新 `markdown` 的时候能自动刷新浏览器。

安装 [gulp](https://gulpjs.com/) 及其相关依赖：
```bash
npm i gulp browser-sync
```

在项目根目录创建 `gulpfile.js`
```js
sfsfsfss
```
111sfs