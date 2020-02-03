const through = require('through2');
const PluginError = require('plugin-error');
const fs = require('fs')
const pug = require('pug')

const md2html = require('./md')

module.exports = (options = {}) => {
  return through.obj(async (file, encoding, callback) => {
    if (file.isNull()) {
      callback(null, file);
      return;
    }

    try {
      const obj = md2html(file.path)
      const f = fs.statSync(file.path)
      const name = file.path.slice(process.cwd().length, -3)
      const url = name + '.html'
      const compiledFunction = pug.compileFile(options.template)
      const str = compiledFunction({
        ...obj,
      })
      options.visit && options.visit({
        updateTime: f.mtime,
        createTime: f.birthtime,
        url,
        ...obj
      })
      file.contents = Buffer.from(str);
      file.extname = '.html'
      callback(null, file);
    } catch (error) {
      callback(new PluginError('gulp-markdown-to-html', error, { fileName: file.path }));
    }
  });
};