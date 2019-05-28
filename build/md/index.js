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
const getDes = require('./getDes')
const macWindow = require('./addMacWindow')
const getTitle = require('./getTitle')

module.exports = function (markdownPath) {
  var processor = unified()
    .use(getDes)
    .use(highlight)
    .use(markdown)
    .use(autoToc)
    .use(rfm)
    .use(gfm)
    .use(slug)
    .use(toc, { tight: true, maxDepth: 2, heading: '目录' })
    .use(remark2rehype)
    .use(test)
    .use(macWindow)
    .use(getTitle)
    .use(html)



  function test() {

    return function transformer(tree, file) {
      // console.dir(tree, { depth: 4 })
    }
  }

  const file = processor.processSync(vfile.readSync(markdownPath))
  console.error(report(file))
  console.log(file._h1)
  return {
    _doc: file.contents,
    _description: file._description,
    _search: file._search,
    _h1: file._h1,
    ...file.data
  }
}