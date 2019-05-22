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
const autoToc = require('./addToc')

module.exports = function (markdownPath) {
  var processor = unified()


    .use(highlight)
    .use(markdown)
    .use(autoToc)
    .use(rfm)
    .use(gfm)
    .use(slug)
    .use(toc, { tight: true, maxDepth: 2, heading: '目录' })
    .use(test)
    .use(remark2rehype)
    .use(html)



  function test() {

    return function transformer(tree, file) {
      console.dir(tree, { depth: 4 })
    }
  }

  const file = processor.processSync(vfile.readSync(markdownPath))
  return {
    doc: file.contents,
    ...file.data
  }
}