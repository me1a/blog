const through = require('through2');
const PluginError = require('plugin-error');


const md2html = require('./md2html')

module.exports = options => {
  return through.obj(async (file, encoding, callback) => {
    if (file.isNull()) {
      callback(null, file);
      return;
    }



    try {
      file.contents = Buffer.from(md2html(file.path));
      file.extname = '.html';
      callback(null, file);
    } catch (error) {
      callback(new PluginError('gulp-markdown-concat-pug', error, { fileName: file.path }));
    }
  });
};