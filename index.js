require('./config.js')
'use strict';
const { WAConnection, MessageType, Mimetype, GroupSettingChange, WAMessageProto, generateMessageID } = require('@adiwajshing/baileys')
const simple = require('./lib/simple.js')
const Client = simple.WAConnection(WAConnection)
const convert = require('./lib/converter.js')
const utils = require('./lib/utils.js')
const api = require("./lib/api");
const { color, print, isUrl } = utils
const { menu, mess, stats } = require('./lib/text.js')

let telegraph = require('telegraph-uploader')
let nhentai = require('nhentai-node-api')
let fetch = require('node-fetch')
let yts = require('yt-search')
let axios = require('axios')
let chalk = require('chalk')
let hx = require('hxz-api')
let fs = require('fs-extra')
let path = require('path')
let util = require('util')

let acrcloud = require('acrcloud')
let acr = new acrcloud({
	host: 'identify-eu-west-1.acrcloud.com',
	access_key: 'f692756eebf6326010ab8694246d80e7',
	access_secret: 'm2KQYmHdBCthmD7sOTtBExB9089TL7hiAazcUEmb'
})

let confirmation = {}
let session = './session.data.json'

async function start(session) {
	global.conn = new Client()
	console.log(color('[ BOT ]', 'yellow'), color('Loading...'))
	conn.on('qr', () => {
		console.log(color('[ BOT ]', 'yellow'), color('Scan QR Code'))
	})
	if (fs.existsSync(session)) conn.loadAuthInfo(session)
	conn.on('connecting', () => {
		console.log(color('[ BOT ]', 'yellow'), color('Connecting...'))
	})
	conn.on('open', () => {
		console.log(color('[ BOT ]', 'yellow'), color('Connected!!'))
	})
	conn.connect().then(() => {
		console.log(color('[ BOT ]', 'yellow'), color(`Success Connect to:\n> Name: ${conn.user.name}\n> No: ${conn.user.jid.split('@')[0]}`))
		fs.writeFileSync(session, JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))
	})
	conn.on('close', () => {
		setTimeout(async () => {
			try {
				if (conn.state == 'close') {
					if (fs.existsSync(session)) await conn.loadAuthInfo(session)
					await conn.connect()
					fs.writeFileSync(session, JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))
				}
			} catch (e) {
				conn.logger.error(e)
			}
		}, 5000)
	})
	
	conn.on('CB:action,,call', async json => {
		console.log(JSON.stringify(json))
		let { from } = json[2][0][1]
		let id = json[2][0][2][0][1]['call-id']
		if (!rejectCall) return
		await conn.rejectIncomingCall(from, id).then(() => conn.reply(from, `Sorry.. Bot Can\'t Receive Calls!`, null, { thumbnail: global.thumb, contextInfo: { stanzaId: id, participant: '0@s.whatsapp.net', quotedMessage: { imageMessage: { jpegThumbnail: global.thumb, caption: '' }}, remoteJid: 'status@broadcast' }}))
	})
	
	conn.on('chat-update', async chat => {
		try {
			if (!chat.hasNewMessage) return
			let m = chat.messages.all()[0]
			if (!m.message || m.key && m.key.remoteJid == 'status@broadcast') return
			m.message = m.message.hasOwnProperty('ephemeralMessage') ? m.message.ephemeralMessage.message : m.message
			await simple.smsg(conn, m)
			switch (m.mtype) {
				case 'audioMessage':
				case 'videoMessage':
				case 'imageMessage':
				case 'stickerMessage':
				case 'documentMessage': {
					if (!m.fromMe) await utils.sleep(1000)
					if (!m.msg.url) await conn.updateMediaMessage(m)
					break
				}
			}
			let { chat: from, fromMe, isGroup, sender, mtype, quoted, mentionedJid, reply, isQuotedSticker, isQuotedImage, isQuotedVideo, isQuotedDocument, isQuotedAudio, isBaileys } = m
			if (isBaileys) return
			let body = typeof m.text == 'string' ? m.text : ''
			let budy = m.message.conversation || m.message[m.mtype].text
			let command = body.toLowerCase().split(/ +/)[0] || ''
			let prefix = /^[°•π÷×¶∆£¢€¥®™✓=|~`,*zxcv!?@#$%^&.\/\\©^]/.test(command) ? command.match(/^[°•π÷×¶∆£¢€¥®™✓=|~`,*zxcv!?@#$%^&.\/\\©^]/gi) : global.prefix
			let args = body.trim().split(/ +/).slice(1)
			let text = args.join` `
			
			const groupMetadata = isGroup ? await conn.groupMetadata(from) : ''
			const groupName = isGroup ? groupMetadata.subject : ''
			const groupMembers = isGroup ? groupMetadata.participants : []
			const Admin = isGroup ? groupMembers.find(v => v.jid == sender) : {}
            const isAdmin = Admin.isAdmin || Admin.isSuperAdmin || false
            const BotAdmin = isGroup ? groupMembers.find(v => v.jid == conn.user.jid) : {}
            const isBotAdmin = BotAdmin.isAdmin || BotAdmin.isSuperAdmin || false
			
			let pushname = fromMe ? conn.user.name : conn.getName(sender)
			let time = utils.getTime('L HH:mm:ss')
			let isOwner = fromMe || global.ownerNumber.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net').includes(sender)
			let print = function(teks) {
				if (typeof teks !== 'string') teks = require('util').inspect(teks)
				teks = require('util').format(teks)
				return conn.reply(from, teks, msg)
			}
			if (m.message) {
				console.log(chalk.black(chalk.bgWhite('[ MSG ]')), chalk.black(chalk.bgGreen(time)), chalk.black(chalk.bgBlue(body || m.mtype)) + '\n' + chalk.magenta('> Dari'), chalk.green(pushname), chalk.yellow(sender) + '\n' + chalk.blueBright('> Di'), chalk.green(isGroup ? groupName : 'Private Chat', from))
			}
			if (quoted && quoted.fromMe && quoted.isBaileys && budy) {
	            let res = await utils.fetchJson('https://api.simsimi.net/v2/?text=' + budy + '&lc=id')
	            reply(res.success)
            }
			
			switch (command) {
				case prefix + 'help': 
				case prefix + 'menu': {
					let ucapWaktu = utils.getTime('a').replace(/^./, v => v.toUpperCase())
					ucapWaktu = 'Selamat ' + ucapWaktu + ' @' + sender.split('@')[0]
					let thumb = utils.pickRandom(['https://wallpapercave.com/wp/wp8600327.jpg','https://wallpapercave.com/wp/wp8523697.jpg','https://wallpapercave.com/wp/wp8174504.jpg','https://wallpapercave.com/wp/wp7432867.jpg','https://wallpapercave.com/wp/wp6192350.jpg'])
					thumb = await utils.getBuffer(thumb)
					let prep = await conn.toMSG(thumb, 'imageMessage')
					conn.sendMessage(from, { contentText: menu(m, body, utils).trim(), footerText: ucapWaktu, buttons: [{ buttonId: `${prefix}status`, buttonText: { displayText: 'Status' }, type: 1 },{ buttonId: `${prefix}owner`, buttonText: { displayText: 'Creator' }, type: 1 }], headerType: 'IMAGE', imageMessage: prep }, 'buttonsMessage', { quoted: m, contextInfo: { mentionedJid: [sender], externalAdReply: { title: 'Velgrynd Bot', body: 'click me :3', thumbnail: global.thumb, sourceUrl: 'https://github.com/ultimareall/' }}})
					break
				}
				// Owmner
				case '>': 
				case '>>': {
					let syntaxErr = require('syntax-error')
					if (!isOwner) return
					let _syntax = ''
					let _return
					let _text = `(async () => { ${body.includes('>>') ? body.replace('>>', 'return') : body.replace('>', '')} })()`
					try {
						_return = await eval(_text)
					} catch (e) {
						let err = await syntaxErr(_text, 'Execution Function')
						if (err) _syntax = '```' + err + '```\n\n'
						_return = e
					} finally {
						reply(_syntax + util.format(_return))
					}
					break
				}
				case '$': 
				case prefix + 'term': {
					let cp = require('child_process')
					if (!(isOwner && text)) return
					reply('Executing...')
					let exec = util.promisify(cp.exec).bind(cp)
					let o
					try {
						o = await exec(text)
					} catch (e) {
						o = e
					} finally {
						let { stdout, stderr } = o
						if (stdout) reply(stdout)
						if (stderr) reply(stderr)
					}
					break
				}
				case prefix + 'setpp': 
				case prefix + 'setppbot': {
					if (!isOwner) return
					let media = quoted ? quoted : m
					if (/image|document/.test(media.mtype)) {
						reply(mess.wait)
						conn.updateProfilePicture(conn.user.jid, await media.download()).then(() => reply('Sukses Update Profile Picture Bot'))
					} else reply('Fotonya?')
					break
				}
				// Ye
				case prefix + 'owner': {
					let listOwner = new Array()
					for (let i of global.ownerNumber.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net')) {
						listOwner.push({ vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;;;;\nFN:${conn.getName(i)}\nitem1.TEL;waid=${i.split('@')[0]}:${i.split('@')[0]}\nitem1.X-ABLabel:Home\nEND:VCARD` })
					}
					conn.sendMessage(from, { displayName: listOwner.length + ' kontak', contacts: listOwner }, 'contactsArrayMessage', { quoted: m })
					break
				}
				case prefix + 'p': 
				case prefix + 'ping': {
					let moment = require('moment-timezone')
					reply('Speed: ' + utils.processTime(m.messageTimestamp, moment()) + ' second')
					break
				}
				case prefix + 'uptime': 
				case prefix + 'runtime': {
					reply('Runtime Bot: ' + utils.clockString(process.uptime()))
					break
				}
				case prefix + 'delete': {
					if (quoted && quoted.fromMe) {
						await quoted.delete()
					}
					break
				}
				case prefix + 'status': {
					reply(stats(m, utils).trim())
					break
				}
				case prefix + 'q': {
					if (!quoted) return reply(`Penggunaan ${command} reply chat`)
					let q = await conn.serializeM(await m.getQuotedObj())
					if (!q.quoted) return reply('Chat yg direply tidak mengandung reply')
					await q.quoted.copyNForward(from, true, { quoted: m }).catch(e => reply(String(e)))
					break
				}
				case prefix + 'rvo': 
				case prefix + 'readviewonce': {
					if (!quoted) return reply(`Penggunaan ${command} reply viewOnce message`)
					if (quoted.mtype !== 'viewOnceMessage') return reply('Reply chat viewOnce')
					conn.copyNForward(from, await conn.loadMessage(from, quoted.id), true, { readViewOnce: true, quoted: m }).catch(console.log)
					break
				}
				// Gmrup
				case prefix + 'setppgrup': {
					if (!isGroup) return reply(mess.groupOnly)
					if (!isBotAdmin) return reply(mess.botAdmin)
					let media = quoted ? quoted : m
					if (/image|document/.test(media.mtype)) {
						reply(mess.wait)
						conn.updateProfilePicture(from, await media.download()).then(() => reply('Sukses Update Profile Picture Group'))
					} else reply('Fotonya?')
					break
				}
				case prefix + 'hidetag': {
					if (!isGroup) return reply(mess.groupOnly)
					let users = groupMembers.map(u => u.jid)
					let q = quoted ? quoted : m
					let c = quoted ? quoted : m.msg
					let msg = conn.cMod(from, conn.prepareMessageFromContent(from, { [c.toJSON ? q.mtype : 'extendedTextMessage']: c.toJSON ? c.toJSON() : { text: c || '' }}, { contextInfo: { mentionedJid: users }, quoted: null }), text || q.text)
					await conn.relayWAMessage(msg)
					break
				}
				case prefix + 'linkgrup': {
					if (!isGroup) return reply(mess.groupOnly)
					if (!isBotAdmin) return reply(mess.botAdmin)
					await conn.groupInviteCode(from).then(v => conn.reply(from, 'https://chat.whatsapp.com/' + v, m))
					break
				}
				case prefix + 'revoke': {
					if (!isGroup) return reply(mess.groupOnly)
					if (!isBotAdmin) return reply(mess.botAdmin)
					if (!isAdmin) return reply(mess.adminOnly)
					await conn.revokeInvite(from).then(v => conn.reply(from, 'Link Group Berhasil Direset!\n\nLink Baru:\nhttps://chat.whatsapp.com/' + v.code, m))
					break
				}
				case prefix + 'add': {
					if (!isGroup) return reply(mess.groupOnly)
					if (!isBotAdmin) return reply(mess.botAdmin)
					if (!isAdmin) return reply(mess.adminOnly)
					if (!text) return reply(`Penggunaan ${command} +62 813-8283-62494`)
					let _participants = groupMembers.map(v => v.jid)
					let mem = text.replace(/\D/g, '') + '@s.whatsapp.net'
					let users = (await Promise.all(mem.split(',').map(v => v.replace(/\D/g, '')).filter(v => v.length > 4 && v.length < 20 && !_participants.includes(v)).map(async v => [v, await conn.isOnWhatsApp(v)]))).filter(v => v[1]).map(v => v[0] + '@c.us')
					let response = await conn.groupAdd(from, users)
					if (response[users] == 408) return reply('Nomor tersebut telah keluar baru² ini')
					let pp = await conn.getProfilePicture(from)
					let jpegThumbnail = pp ? await utils.getBuffer(pp) : null
					for (let v of response.participants.filter(v => Object.values(v)[0].code == 403)) {
						let [[jid, { invite_code, invite_code_exp }]] = Object.entries(v)
						let teks = `Mengundang @${jid.split('@')[0]} menggunakan invite...`
						reply(teks, from, { contextInfo: { mentionedJid: conn.parseMention(teks) }})
						await conn.sendMessage(jid, { groupJid: from, inviteCode: invite_code, inviteExpiration: invite_code_exp, groupName: groupName, jpegThumbnail: jpegThumbnail, caption: `@${sender.split('@')[0]} mengundang Anda untuk bergabung dalam Grup ${groupName}` }, 'groupInviteMessage', { contextInfo: { mentionedJid: [sender], stanzaId: generateMessageID(), participant: sender, quotedMessage: { extendedTextMessage: { text: body }}, remoteJid: from }})
					}
					break
				}
				case prefix + 'promote': {
					if (!isGroup) return reply(mess.groupOnly)
					if (!isBotAdmin) return reply(mess.botAdmin)
					if (!isAdmin) return reply(mess.adminOnly)
					let mem = quoted ? [quoted.sender] : mentionedJid
					if (!mem[0]) return reply(mess.wrongF)
					mem.map(v => conn.groupMakeAdmin(from, [v]))
					reply('Selesai ~')
					break
				}
				case prefix + 'demote': {
					if (!isGroup) return reply(mess.groupOnly)
					if (!isBotAdmin) return reply(mess.botAdmin)
					if (!isAdmin) return reply(mess.adminOnly)
					let mem = quoted ? [quoted.sender] : mentionedJid
					if (!mem[0]) return reply(mess.wrongF)
					mem.map(v => conn.groupDemoteAdmin(from, [v]))
					reply('Selesai ~')
					break
				}
				// Converter
				case prefix + 's': 
				case prefix + 'stiker': 
				case prefix + 'sticker': {
					let media = quoted ? quoted : m
					let [pack, pack2] = text.split`|`
					if (args[0] && /https?:\/\//.test(args[0])) {
						fs.writeFileSync(`./tmp/${sender}.webp`, await utils.getBuffer(args[0]))
						conn.sendImageAsSticker(from, fs.readFileSync(`./tmp/${sender}.webp`).toString('base64'), m, { packname: pushname, author: author }).then(() => fs.unlinkSync(`./tmp/${sender}.webp`))
					} else if (isQuotedSticker && !quoted.isAnimated || isQuotedDocument && /image/.test(quoted.mimetype) || /image/.test(media.mtype)) {
						let img = await media.download()
						conn.sendImageAsSticker(from, img.toString('base64'), m, { packname: pack || pushname, author: pack2 || groupName })
					} else if (isQuotedDocument && /video/.test(quoted.mimetype) || /video/.test(media.mtype)) {
						let img = await media.download()
						conn.sendMp4AsSticker(from, img.toString('base64'), m, { packname: pack || pushname, author: pack2 || groupName })
					} else reply('Conversion failed')
					break
				}
				case prefix + 'getexif': {
					let webp = require('node-webpmux')
					if (isQuotedSticker) {
						reply(mess.wait)
						let img = new webp.Image()
						await img.load(await quoted.download())
						reply(util.format(JSON.parse(img.exif.slice(22).toString())))
					} else reply(`Penggunaan ${command} reply sticker`)
					break
				}
				case prefix + 'tomp3': {
					let media = quoted ? quoted : m
					if (isQuotedDocument && /video/.test(quoted.mimetype) || /video/.test(media.mtype)) {
						reply(mess.wait)
						await convert.toAudio(await media.download(), 'mp4').then(v => conn.sendMessage(from, v, 'audioMessage', { quoted: m, mimetype: 'audio/mp4' }))
					} else if (isQuotedDocument && /audio/.test(quoted.mimetype) || isQuotedAudio) {
						reply(mess.wait)
						await convert.toPTT(await media.download(), 'mp4').then(v => conn.sendMessage(from, v, 'audioMessage', { quoted: m, ptt: true, mimetype: 'audio/mp4' }))
					} else reply(`Penggunaan ${command} reply video`)
					break
				}
				case prefix + 'toimg': 
				case prefix + 'tovideo': {
					if (isQuotedSticker && quoted.isAnimated == false) {
						reply(mess.wait)
						await convert.webp2png(await quoted.download()).then(v => conn.sendFile(from, v, '', '', m))
					} else if (isQuotedSticker && quoted.isAnimated == true) {
						reply(mess.wait)
						await convert.webp2mp4(await quoted.download()).then(v => conn.sendFile(from, v, '', '', m))
					} else if (isQuotedDocument && /audio/.test(quoted.mimetype) || isQuotedAudio) {
						reply(mess.wait)
						await convert.ffmpeg(await quoted.download(), ['-filter_complex', 'color', '-pix_fmt', 'yuv420p', '-crf', '51', '-c:a', 'copy', '-shortest'], 'mp3', 'mp4').then(v => conn.sendFile(from, v, '', '', m))
					} else reply(`Penggunaan ${command} reply sticker/gif`)
					break
				}
				case prefix + 'tourl': {
					let media = quoted ? quoted : m
					if (/image|video/.test(media.mtype)) {
						reply(mess.wait)
						await utils.uploadImage(await media.download()).then(v => reply(v))
					} else if (/sticker|audio|document/.test(media.mtype)) {
						reply(mess.wait)
						let ext = quoted ? quoted.mimetype.split('/')[1] : m.msg.mimetype.split('/')[1]
						await require('uguu-api').upload('.' + ext, await media.download()).then(v => reply(v.url + '\n\n*Note: Link expire after 48 hours'))
					} else reply(`Penggunaan ${command} reply image`)
					break
				}
				case prefix + 'scircle': {
				    let media = quoted ? quoted : m
					if (isQuotedSticker && quoted.isAnimated == false) {
						reply(mess.wait)
						let img = await convert.webp2png(await quoted.download())
						let link = await telegraph.uploadByUrl(img)
						fs.writeFileSync(`./tmp/${sender}`, await utils.getBuffer(`https://velgrynd.herokuapp.com/api/circle?url=${link.link}`))
						conn.sendImageAsSticker(from, fs.readFileSync(`./tmp/${sender}`).toString('base64'), m).then(() => fs.unlinkSync(`./tmp/${sender}`))
				    } else if (/image/.test(media.mtype)) {
						reply(mess.wait)
					    let ext = quoted ? quoted.mimetype.split('/')[1] : m.msg.mimetype.split('/')[1]
					    let link = await utils.uploadImage(await media.download())
					    fs.writeFileSync(`./tmp/${sender}.${ext}`, await utils.getBuffer(`https://velgrynd.herokuapp.com/api/circle?url=${link}`))
					    conn.sendImageAsSticker(from, fs.readFileSync(`./tmp/${sender}.${ext}`).toString('base64'), m, { packname: pushname, author: groupName })
					    fs.unlinkSync(`./tmp/${sender}.${ext}`)
					} else reply(`Penggunaan ${command} reply sticker/image dengan caption teks|teks`)
				  break
			    }
			    case prefix + 'smeme': {
					let [t1, t2] = text.split`|`
					if (!t1) reply(mess.wrongF)
					if (!t2) { t2 = t1, t1 = ' ' }
					let media = quoted ? quoted : m
					if (isQuotedSticker && quoted.isAnimated == false) {
						reply(mess.wait)
						let img = await convert.webp2png(await quoted.download())
						let link = await telegraph.uploadByUrl(img)
						fs.writeFileSync(`./tmp/${sender}`, await utils.getBuffer(`https://api.memegen.link/images/custom/${encodeURIComponent(t1)}/${encodeURIComponent(t2)}.png?background=${link.link}`))
						conn.sendImageAsSticker(from, fs.readFileSync(`./tmp/${sender}`).toString('base64'), m).then(() => fs.unlinkSync(`./tmp/${sender}`))
					} else if (/image/.test(media.mtype)) {
						reply(mess.wait)
						let link = await utils.uploadImage(await media.download())
						fs.writeFileSync(`./tmp/${sender}`, await utils.getBuffer(`https://api.memegen.link/images/custom/${encodeURIComponent(t1)}/${encodeURIComponent(t2)}.png?background=${link}`))
						conn.sendImageAsSticker(from, fs.readFileSync(`./tmp/${sender}`).toString('base64'), m).then(() => fs.unlinkSync(`./tmp/${sender}`))
					} else reply(`Penggunaan ${command} reply sticker/image dengan caption teks|teks`)
				    break
				}
				// Semrching
				case prefix + 'google': {
					let googleIt = require('google-it')
					if (!text) return reply(`Penggunaan ${command} kapankah Indonesia merdeka?`)
					reply(mess.wait)
					let url = 'https://google.com/search?q=' + encodeURIComponent(text)
					let data = await googleIt({ query: text,disableConsole: true })
					let txt = data.map(({ title, link, snippet }) => {
						return `*${title}*\n_${link}_\n_${snippet}_`
					}).join`\n\n`
					conn.reply(from, url + '\n\n' + txt, m)
					break
				}
				case prefix + 'pinterest': {
					if (!text) return reply(`Penggunaan ${command} query`)
				    reply(mess.wait)
				    await api.pinterest(text)
					  .then(res => {
					      let result = utils.pickRandom(res)
                          conn.sendFile(from, result, 'img.jpg', '*Pencarian:* ' + text + '\n*URL:* ' + result, m)
                      })
					  .catch(err => {
						  console.log(err)
						  conn.reply(from, mess.error.api, m)
					   })
			      break
			    }
			    case prefix + 'yts': 
				case prefix + 'ytsearch': {
					if (!text) return reply(`Penggunaan ${command} amv 30 detik`)
					let { videos } = await yts(text)
					let nomor = 1
					let capt = ``
					for (let i = 0; i < videos.length; i++) {
						capt += `*${nomor++}. ${videos[i].title}*\n`
						capt += `Url: ${videos[i].url}\n`
						capt += `By: ${videos[i].author.name}\n`
						capt += `Duration: ${videos[i].timestamp}\n`
						capt += `Uploaded: ${videos[i].ago}\n`
						capt += `=`.repeat(25) + `\n`
					}
					reply(capt.trim(), from, { contextInfo: { externalAdReply: { title: videos[0].title, body: videos[0].description, mediaType: 2, thumbnailUrl: videos[0].image, mediaUrl: videos[0].url }}})
					break
				}
				case prefix + 'whatmusic': {
					let media = quoted ? quoted : m
					if (/audio|video|document/.test(media.mtype)) {
						reply(mess.wait)
						let ext = quoted ? quoted.mimetype.split('/')[1] : m.msg.mimetype.split('/')[1]
						let random = Date.now() + '.' + ext
						fs.writeFileSync(`./tmp/${random}`, await media.download())
						acr.identify(fs.readFileSync(`./tmp/${random}`)).then(v => reply('*RESULT FOUND*\n\n*• Title:* ' + v.metadata.music[0].title + '\n*• Artist:* ' + v.metadata.music[0].artists[0].name + '\n*• Album:* ' + v.metadata.music[0].album.name + '\n*• Release date:* ' + v.metadata.music[0].release_date)).catch(e => reply('Result not found :/'))
						fs.unlinkSync(`./tmp/${random}`)
					} else reply(`Penggunaan ${command} reply audio/music`)
					break
				}
				// Downlomder
				case prefix + 'play': {
					if (!text) return reply(`Penggunaan ${command} gotoubun no katachi`)
					reply(mess.wait)
					let { videos } = await yts(text)
					if (videos.length < 1) return reply('Video/Audio Tidak ditemukan')
					let thumbnail = await utils.getBuffer(videos[0].image)
					let prep = await conn.toMSG(thumbnail, 'imageMessage')
					let id = await conn.sendMessage(from, { contentText: `*• Title:* ${videos[0].title}\n*• Duration:* ${videos[0].timestamp}\n*• Upload:* ${videos[0].ago}\n${videos[0].url}`, footerText: '', buttons: [{ buttonId: `${prefix}yta ${videos[0].url}`, buttonText: { displayText: 'Audio' }, type: 1 }, { buttonId: `${prefix}ytv ${videos[0].url}`, buttonText: { displayText: 'Video' }, type: 1 }], headerType: 'IMAGE', imageMessage: prep }, 'buttonsMessage', { quoted: m })
					await utils.sleep(30000)
					conn.deleteMessage(from, id.key)
					break
				}
				case prefix + 'yta': 
				case prefix + 'ytmp3': {
					if (!text) return reply(`Penggunaan ${command} link youtube`)
					reply(mess.wait)
					let data = await yts(args[0])
					data = data.all[0]
					let music = await hx.youtube(args[0])
					let { title, thumb, size_mp3, mp3 } = music
					mp3 = await utils.urlShort(mp3)
					console.log(data, music)
					let thumbnails = await utils.getBuffer(thumb)
					conn.reply(from, `*• Title:* ${title}\n*• Duration:* ${data.timestamp}\n*• Size:* ${size_mp3}\n\n_Sending..._`, m, { contextInfo: { externalAdReply: { title: title, body: data.description, thumbnail: thumbnails, sourceUrl: mp3 }}})
					conn.sendMessage(from, await utils.getBuffer(mp3), 'audioMessage', { quoted: m, mimetype: 'audio/mp4', filename: title + '.mp3', contextInfo: { externalAdReply: { title: title, body: data.description, mediaType: 2, thumbnail: thumbnails, mediaUrl: data.url }}})
					break
				}
				case prefix + 'ytv': 
				case prefix + 'ytmp4': {
					if (!text) return reply(`Penggunaan ${command} link youtube`)
					reply(mess.wait)
					let data = await yts(args[0])
					data = data.all[0]
					let mp4 = await hx.youtube(args[0])
					let { title, size, quality, thumb, link } = mp4
					link = await utils.urlShort(link)
					console.log(data, mp4)
					thumbnails = await utils.getBuffer(thumb)
					conn.reply(from, `*• Title:* ${title}\n*• Quality:* ${quality}\n*• Duration:* ${data.timestamp}\n*• Size:* ${size}\n\n_Sending..._`, m, { contextInfo: { externalAdReply: { title: title, body: data.description, thumbnail: thumbnails, sourceUrl: link }}})
					conn.sendFile(from, link, title + '.mp4', '', m)
					break
				}
				case prefix + 'igdl': {
					if (!text) return reply(`Penggunaan ${command} link instagram`)
					if (!(isUrl(args[0]) && args[0].includes('instagram'))) return reply('Invalid URL')
					reply(mess.wait)
					await hx.igdl(args[0]).then(v => {
						let post = v.medias
						for (let i = 0; i < post.length; i++) {
							let capt = i == 0 ? '*Instagram Post Downloader*\n\n*• User:* ' + v.user.username + '\n*• Followers:* ' + v.user.followers + '\n*• Media count:* ' + post.length : ''
							conn.sendFile(from, post[i].url, '', capt, m)
						}
					})
					break
				}
				case prefix + 'tiktok': {
				    if (!text) return reply(`Penggunaan ${command} link tiktok`)
				    if (!isUrl(args[0]) && !args[0].includes('tiktok.com')) return reply('Harap berikan link yang benar')
				    reply(mess.wait)
				    await api.tiktok(args[0])
					   .then(res => conn.sendFile(from, res.nowm, '', res.caption, m))
					  .catch(err => {
						  console.log(err)
						  conn.reply(from, mess.error.api, m)
					  })
		        break
			  }
			  case prefix + 'tiktok2': {
				  if (!text) return reply(`Penggunaan ${command} link tiktok`)
				  if (!isUrl(args[0]) && !args[0].includes('tiktok.com')) return reply('Harap berikan link yang benar')
				  reply(mess.wait)
				  await api.tiktok2(args[0])
					  .then(res => conn.sendFile(from, res, '', `https://velgrynd.herokuapp.com/api/tiktok2?url=${args[0]}`, m))
					  .catch(err => {
						  console.log(err)
						  conn.reply(from, mess.error.api, m)
					  })
			       break
		        }
				case prefix + 'get': 
				case prefix + 'fetch': {
					if (!text) return reply(mess.wrongF)
					let res = await fetch(args[0])
					if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
						delete res.headers
						reply(`Content-Length: ${res.headers.get('content-length')}`)
					}
					if (!/text|json/.test(res.headers.get('content-type'))) return conn.sendFile(from, text, 'file', text, m)
					let txt = await res.buffer()
					try {
						txt = util.format(JSON.parse(txt + ''))
					} catch (e) {
						txt = txt + ''
					} finally {
						reply(txt.slice(0, 65536) + '')
					}
					break
				}
				case prefix + 'removebg': {
					let media = quoted ? quoted : m
					if (isQuotedDocument && /image/.test(quoted.mimetype) || /image/.test(media.mtype)) {
						reply(mess.wait)
						let ext = quoted ? quoted.mimetype.split('/')[1] : m.msg.mimetype.split('/')[1]
						fs.writeFileSync(`./tmp/${sender}.${ext}`, await media.download())
						await require('removebg-id').FromPath(`./tmp/${sender}.${ext}`, 'sF23TG9qrhGCjXR9ATUA7z16') // jika apikey nya habis kalian bisa create disini https://www.remove.bg/api
						await utils.sleep(10000)
						conn.sendFile(from, './hasil-path.png', 'hasil-path.png', '', m).then(() => {
							fs.unlinkSync(`./tmp/${sender}.${ext}`)
							fs.unlinkSync('./hasil-path.png')
						})
					} else reply(`Penggunaan ${command} reply image`)
					break
				}
				case prefix + 'enhance': {
					let deepai = require('deepai')
					deepai.setApiKey('31c3da72-e27e-474c-b2f4-a1b685722611')
					let media = quoted ? quoted : m
					if (isQuotedDocument && /image/.test(quoted.mimetype) || /image/.test(media.mtype)) {
						reply(mess.wait)
						let ext = quoted ? quoted.mimetype.split('/')[1] : m.msg.mimetype.split('/')[1]
						let random = Date.now() + '.' + ext
						fs.writeFileSync(`./tmp/${random}`, await media.download())
						let resp = await deepai.callStandardApi('waifu2x', { image: fs.readFileSync(`./tmp/${random}`) })
						conn.sendFile(from, resp.output_url, random, 'Nih', m).then(() => fs.unlinkSync(`./tmp/${random}`))
					} else reply(`Penggunaan ${command} reply image`)
					break
				}
				case prefix + 'colorize': {
					let deepai = require('deepai')
					deepai.setApiKey('31c3da72-e27e-474c-b2f4-a1b685722611')
					let media = quoted ? quoted : m
					if (isQuotedDocument && /image/.test(quoted.mimetype) || /image/.test(media.mtype)) {
						reply(mess.wait)
						let ext = quoted ? quoted.mimetype.split('/')[1] : m.msg.mimetype.split('/')[1]
						let random = Date.now() + '.' + ext
						fs.writeFileSync(`./tmp/${random}`, await media.download())
						let resp = await deepai.callStandardApi('colorizer', { image: fs.readFileSync(`./tmp/${random}`) })
						conn.sendFile(from, resp.output_url, random, '', m).then(() => fs.unlinkSync(`./tmp/${random}`))
					} else reply(`Penggunaan ${command} reply image`)
					break
				}
				case prefix + 'nhentai': {
					try {
						require('./lib/downloader.js').NhentaiDl(m, args, utils)
					} catch (e) {
						reply('Code tidak valid')
					}
					break
				}
				case prefix + 'nhlatest': {
					let latest = await nhentai.getLatest()
					let txt = latest.map(({ title, id, language }) => {
						return `*${title}*\n• ID: ${id}\n• Language: ${language}\n• Link: https://cin.pw/v/${id}`}).join('\n' + '='.repeat(25) + '\n')
					await conn.sendFile(from, latest[0].thumbnail, '', '*NHentai Latest*\n\n' + txt, m)
					break
				}
				case prefix + 'nhsearch': {
					if (!text) return reply(`Penggunaan ${command} query`)
					let res = await nhentai.search(text)
					let txt = res.map(({ title, id, language }) => {
						return `*${title}*\n• ID: ${id}\n• Language: ${language}\n• Link: https://cin.pw/v/${id}`}).join('\n' + '='.repeat(25) + '\n')
					await conn.sendFile(from, res[0].thumbnail, '', '*NHentai Search*\n\n' + txt, m)
					break
				}
			}
	   } catch (e) {
			let m = chat.messages.all()[0]
			conn.logger.error(e)
			conn.reply(m.key.remoteJid, String(e), 'conversation', { quoted: m })
		}
	})
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(color('[ UPDATE ]', 'magenta'), color(`=> 'index.js'`, 'aqua'))
	delete require.cache[file]
	require(file)
})

start(session)