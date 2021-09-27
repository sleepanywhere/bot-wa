exports.menu = (m, body, utils) => {
	let tanggal = utils.getTime('dddd, DD MMM YYYY')
	let waktu = utils.getTime('a').replace(/^./, v => v.toUpperCase())
	let time = utils.getTime('HH:mm:ss z')
	let uptime = utils.clockString(process.uptime())
	let prefix = body.charAt(0)
	return `
*INFO*
*• Tanggal:* ${tanggal}
*• Waktu:* ${waktu} || ${time}
*• Runtime Bot:* ${uptime}

*Group*
• ${prefix}add <nomornya>
• ${prefix}demote <@tag/reply>
• ${prefix}promote <@tag/reply>
• ${prefix}hidetag <text/replychat>
• ${prefix}revoke
• ${prefix}linkgrup
• ${prefix}setppgrup

*Downloader*
• ${prefix}play >query<
• ${prefix}igdl >link<
• ${prefix}ytmp3 >link<
• ${prefix}ytmp4 >link<
• ${prefix}tiktok >link<
• ${prefix}tiktok2 >link<

*Converter*
• ${prefix}stiker <reply media>
• ${prefix}scircle <reply image/sticker>
• ${prefix}smeme >teks|teks<
• ${prefix}getexif >reply sticker<
• ${prefix}toimg <reply sticker>
• ${prefix}tovideo <reply media>
• ${prefix}tomp3 <caption/reply>
• ${prefix}tourl <caption/reply>

*Nhentai*
• ${prefix}nhentai <code>
• ${prefix}nhsearch <query>
• ${prefix}nhlatest

*Searching*
• ${prefix}google <query>
• ${prefix}ytsearch <query>
• ${prefix}pinterest <query>

*Other*
• ${prefix}removebg <caption/reply>
• ${prefix}enhance <caption/reply>
• ${prefix}rvo <reply viewOnce>
• ${prefix}colorize <caption/reply>
• ${prefix}fetch >url<
• ${prefix}whatmusic >reply audio<
• ${prefix}setppbot
`
}

exports.mess = {
	wait: '*_Tunggu permintaan anda sedang diproses_*',
	error: {
        Iv: 'Link yang kamu berikan tidak valid',
        api: 'Maaf terjadi kesalahan'
    },
	wrongF: 'Format salah! ',
	groupOnly: 'Perintah ini hanya bisa digunakan di dalam grup!',
	adminOnly: 'Perintah ini hanya bisa digunakan oleh Admin Grup!',
	botAdmin: 'Perintah ini hanya bisa digunakan ketika Bot menjadi Admin!',
	ownerOnly: 'Perintah ini hanya bisa digunakan oleh Owner Bot!'
}

exports.stats = (m, utils) => {
	let os = require('os')
	let moment = require('moment-timezone')
	let chats = conn.chats.all()
	let groups = chats.filter(v => v.jid.endsWith('g.us'))
	let groupsIn = groups.filter(v => !v.read_only)
	let { wa_version, os_version, device_manufacturer, device_model } = conn.user.phone
	return `
*STATUS*
*• Groups Chat:* ${groups.length}
*• Groups Joined:* ${groupsIn.length}
*• Groups Left:* ${groups.length - groupsIn.length}
*• Personal Chats:* ${chats.length - groups.length}
*• Total Chats:* ${chats.length}
*• Runtime:* ${utils.clockString(process.uptime())}

*PHONE INFO*
*• Battery:* ${conn.battery ? `${conn.battery.value}% ${conn.battery.live ? 'Charging...' : 'Discharging'}` : 'Unknown'}
*• RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(os.totalmem / 1024 / 1024)}MB
*• Device:* ${device_manufacturer}
*• Device Version:* ${device_model}
*• OS Version:* ${os_version}
*• Uptime:* ${utils.clockString(os.uptime())}

_Merespon dalam ${utils.processTime(m.messageTimestamp, moment())} second_
`
}

let fs = require('fs')
let chalk = require('chalk')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.green("[ UPDATE ] 'text.js'"))
	delete require.cache[file]
	require(file)
})
