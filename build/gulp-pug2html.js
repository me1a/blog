const through = require('through2')
const PluginError = require('plugin-error')
const pug = require('pug')



module.exports = options => {
  return through.obj(async (file, encoding, callback) => {
    if (file.isNull()) {
      callback(null, file);
      return;
    }



    try {
      const compiledFunction = pug.compileFile(options.template)
      const str = compiledFunction({
        ...file.data,
      })

      file.contents = Buffer.from(str);
      file.extname = '.html'
      callback(null, file);
    } catch (error) {
      callback(new PluginError('gulp-obj-pug', error, { fileName: file.path }));
    }
  });
};