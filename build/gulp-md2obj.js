const through = require('through2');
const PluginError = require('plugin-error');
const fs = require('fs')
const path = require('path')

const md2html = require('./md')

module.exports = (options = {}) => {
  return through.obj(async (file, encoding, callback) => {
    if (file.isNull()) {
      callback(null, file);
      return;
    }

    try {
      const obj = md2html(file.path)
      file.contents = Buffer.from(obj.doc);
      const f = fs.statSync(file.path)
      const name = file.path.slice(process.cwd().length, -3)
      const url = name + '.html'
      file.data = obj

      options.visit && options.visit({
        updateTime: f.mtime,
        createTime: f.birthtime,
        url,
        ...obj
      })
      callback(null, file);
    } catch (error) {
      callback(new PluginError('gulp-markdown-obj', error, { fileName: file.path }));
    }
  });
};