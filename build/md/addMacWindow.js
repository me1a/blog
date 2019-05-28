// 给代码添加mac窗口
module.exports = function () {
  return function transformer(tree, data) {
    const children = tree.children
    tree.children = children.map((item, key) => {
      if (item.type === 'element' && item.tagName === 'pre') {
        if (Array.isArray(item.children) && item.children[0].tagName === 'code') {
          const c = item.children[0].properties.className
          item.children[0].properties.className = Array.isArray(c) ? c.includes('hljs') ? c : [...c, 'hljs', 'language-bash'] : ['hljs', 'language-bash']
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-box'] },
            children: [
              {
                type: 'element', tagName: 'div', properties: { className: ['code-box-control'] }, children: [
                  { type: 'element', tagName: 'span', properties: { className: ['code-box-control-close'] } },
                  { type: 'element', tagName: 'span', properties: { className: ['code-box-control-min'] } },
                  { type: 'element', tagName: 'span', properties: { className: ['code-box-control-max'] } }
                ]
              },
              item
            ]
          }
        }
      }
      return item
    })
  }
}