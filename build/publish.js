const Fjpublish = require('Fjpublish')
const prompt = require('Fjpublish/lib/fjpublish_prompt.js')
const git = require('Fjpublish/lib/fjpublish_git.js')
const builder = require('Fjpublish/lib/fjpublish_builder.js')
const compress = require('Fjpublish/lib/fjpublish_compress.js')
const sftp = require('Fjpublish/lib/fjpublish_sftp.js')
const shell = require('Fjpublish/lib/fjpublish_shell.js')

Fjpublish({
  modules: [{
    name: 'blog',
    env: 'prod',
    ssh: {
      host: '150.109.53.9',
      port: 22,
      username: 'ubuntu',
      privateKey: require('fs').readFileSync('/Users/me/files/mac'),
    },
    localPath: 'dist',

    remotePath: '/home/ubuntu/site/blog'
  }],
  nobuild: true
})
  .use(prompt)
  .use(git)
  .use(builder)
  .use(compress)
  .use(sftp)
  .use(shell)
  .start()
