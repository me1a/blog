var unified = require('unified')
var vfile = require('to-vfile')
var report = require('vfile-reporter')
var markdown = require('remark-parse')
var slug = require('remark-slug')
var toc = require('remark-toc')
var remark2rehype = require('remark-rehype')
var doc = require('rehype-document')
var html = require('rehype-stringify')



module.exports = function (markdownPath) {
  var processor = unified()
    .use(test)
    .use(markdown)
    .use(slug)
    .use(toc)
    .use(remark2rehype)
    .use(doc, { title: 'Contents' })
    .use(html)



  function test() {

    return function transformer(tree, file) {
      // console.dir(JSON.parse(JSON.stringify(tree)), { depth: 10 })
    }
  }

  const file = processor.processSync(vfile.readSync(markdownPath))
  return file.contents
}