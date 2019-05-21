# 打造一个的博客网站

博客记录自己的成长轨迹，是非常有必要的，鉴于工作近三年，有必要搭建一个博客系统。 一来不给自己逃避记录的理由， 二来想了解下这方面的技术。

在选型上，考虑博客是主要功能 **记录自己** 和  **展现他人**，所以简单、快是一个重要的指标，加上三大框架（`React`, `Vue`, `Angular`）似乎有些小题大作，而且速度和简单性没有纯HTML来的直接，另一方面，现开发者大都是使用 `markdown` 来书写博客，考虑到通用性（可发布到各大开发者网站），里面不应包含三大框架的组件，由此，得到了最直接的描述： **写`markdown`，渲染成`HTML`**。

## 将 `markdown` 渲染成 `html`

在 `wikipedia` 中， `markdown` 描述为:
> Markdown是一种轻量级标记语言, 它允许人们“使用易读易写的纯文本格式编写文档，然后转换成有效的XHTML（或者HTML）文档”

`markdown` 的特点是 **轻量化**、**易读易写**。我们现在要将 `markdown` 转化为 `html`。选型上选择了 [unified](!https://unified.js.org/):

> unified is an interface for processing text with syntax trees and transforming between them. <br/>
> unified是一个用语法树处理文本并在它们之间进行转换的接口。

```bash
npm i unified to-vfile vfile-reporter remark-parse remark-toc remark-rehype rehype-document rehype-stringify -S
```


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