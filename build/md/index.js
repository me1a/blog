const unified = require('unified')
const vfile = require('to-vfile')
const report = require('vfile-reporter')
const markdown = require('remark-parse')
const slug = require('remark-slug')
const toc = require('remark-toc')
const remark2rehype = require('remark-rehype')
const html = require('rehype-stringify')
const highlight = require('remark-highlight.js')
const rfm = require('remark-frontmatter')


const gfm = require('./parseFrontMatter')

module.exports = function (markdownPath) {
  var processor = unified()


    .use(highlight)
    .use(markdown)
    .use(rfm)
    .use(gfm)
    .use(test)
    .use(remark2rehype)
    .use(slug)
    .use(toc)
    .use(html)



  function test() {

    return function transformer(tree, file) {
    }
  }

  const file = processor.processSync(vfile.readSync(markdownPath))
  return {
    doc: file.contents,
    ...file.data
  }
}