const unified = require('unified')
const vfile = require('to-vfile')
const report = require('vfile-reporter')
const markdown = require('remark-parse')
const slug = require('remark-slug')
const toc = require('remark-toc')
const remark2rehype = require('remark-rehype')
const html = require('rehype-stringify')
const highlight = require('remark-highlight.js')



module.exports = function (markdownPath) {
  var processor = unified()
    .use(test)
    .use(highlight)
    .use(markdown)
    .use(remark2rehype)
    .use(slug)
    .use(toc)
    .use(html)



  function test() {

    return function transformer(tree, file) {
      // console.dir(JSON.parse(JSON.stringify(tree)), { depth: 10 })
    }
  }

  const file = processor.processSync(vfile.readSync(markdownPath))
  return {
    doc: file.contents
  }
}