var unified = require('unified')
var vfile = require('to-vfile')
var report = require('vfile-reporter')
var markdown = require('remark-parse')
var toc = require('remark-toc')
var remark2rehype = require('remark-rehype')
var doc = require('rehype-document')
var html = require('rehype-stringify')

var processor = unified()
  .use(test)
  .use(markdown)
  .use(toc)
  .use(remark2rehype)
  .use(doc, { title: 'Contents' })
  .use(html)



function test() {

  return function transformer(tree, file) {
    console.dir(JSON.parse(JSON.stringify(tree)), { depth: 10 })
  }
}

processor.process(vfile.readSync('article/MakeBlog.md'), function (err, file) {
  if (err) throw err
  console.error(report(file))
  file.extname = '.html'
  vfile.writeSync(file)
})