global.ownerNumber = ['0', '+62 882-8642-1519', '+62 813-8283-62494', '+62 812-7889-52868']
global.thumb = require('fs').readFileSync('./src/me.jpg')
global.packname = 'velgrynd'
global.author = '✘ 𝐓𝐄𝐌𝐏𝐄𝐒𝐓'
global.rejectCall = false

let fs = require('fs')
let chalk = require('chalk')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.green("[ UPDATE ] 'config.js'"))
	delete require.cache[file]
	require(file)
})
