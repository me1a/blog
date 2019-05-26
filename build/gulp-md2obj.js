const through = require('through2');
const PluginError = require('plugin-error');
const fs = require('fs')
const path = require('path')

const md2html = require('./md')

module.exports = options => {
  return through.obj(async (file, encoding, callback) => {
    if (file.isNull()) {
      callback(null, file);
      return;
    }



    try {
      const { _doc, ...data } = md2html(file.path)
      file.contents = Buffer.from(_doc);
      file.data = data


      const f = fs.statSync(file.path)

      const url = file.path.slice(process.cwd().length)

      options.visit && options.visit({
        ...file.data,
        _updateTime: new Date(f.mtime).toLocaleString(),
        _createTime: new Date(f.birthtime).toLocaleString(),
        _path: file.path,
        _name: path.basename(file.path).replace('.md', ''),
        _url: url.replace('.md', '.html'),
        _search: data._search
      })
      callback(null, file);
    } catch (error) {
      callback(new PluginError('gulp-markdown-obj', error, { fileName: file.path }));
    }
  });
};