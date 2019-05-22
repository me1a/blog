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
      const { doc } = md2html(file.path)
      file.contents = Buffer.from(doc);
      file.data = { name: 'meihuan' }
      callback(null, file);
    } catch (error) {
      callback(new PluginError('gulp-markdown-obj', error, { fileName: file.path }));
    }
  });
};