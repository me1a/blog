const visit = require('unist-util-visit')
module.exports = function getFrontMatter() {
  return function transformer(tree, data) {
    const children = tree.children
    children.forEach(item => {
      if (item.type === 'element' && item.tagName === 'h1') {
        console.log(item.properties.id)
        data._h1 = item.properties.id
      }
    })
  }
}