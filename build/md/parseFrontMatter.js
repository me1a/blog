// 获取文档开头的FrontMatter
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