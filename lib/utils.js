const util = require('util')
const got = require('got')
const chalk = require('chalk')
const fetch = require('node-fetch')
const FormData = require('form-data')
const { fromBuffer } = require('file-type')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')

exports.color = (text, color) => {
	return chalk.keyword(color || 'skyblue')(text)
}
exports.print = (text) => {
	if (typeof text !== 'string') text = util.inspect(text)
	text = util.format(text)
	return text
}
exports.pickRandom = (list) => {
	return list[Math.floor(Math.random() * list.length)]
}
exports.sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms))
}
exports.urlShort = async(url) => {
	return await got.get('https://tinyurl.com/api-create.php?url=' + url).text()
}
exports.isUrl = (url) => {
	return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}
exports.getTime = (format, date) => {
	if (date) {
		return moment(date).locale('id').format(format)
	} else {
		return moment.tz('Asia/Jakarta').locale('id').format(format)
	}
}
exports.getBuffer = async(url, opts = {}) => {
	let response = await fetch(url, opts)
	if (response.status !== 200) throw { status: response.status, message: response.statusText }
	return response.buffer()
}
exports.fetchJson = async(url, opts = {}) => {
	let response = await fetch(url, opts)
	if (response.status !== 200) throw { status: response.status, message: response.statusText }
	return response.json()
}
exports.fetchText = async(url, opts = {}) => {
	let response = await fetch(url, opts)
	if (response.status !== 200) throw { status: response.status, message: response.statusText }
	return response.text()
}
exports.processTime = (timestamp, now) => {
	return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}
exports.clockString = (ms) => {
	let h = isNaN(ms) ? '--' : Math.floor(ms % (3600 * 24) / 3600)
	let m = isNaN(ms) ? '--' : Math.floor(ms % 3600 / 60)
	let s = isNaN(ms) ? '--' : Math.floor(ms % 60)
	return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
exports.bytesToSize = (number) => {
	let tags = [' Bytes', ' KB', ' MB', ' GB', ' TB']
	let tier = Math.log10(Math.abs(number)) / 3 | 0
	if (tier == 0) return number
	let tag = tags[tier]
	let scale = Math.pow(10, tier * 3)
	let scaled = number / scale
	let formatted = scaled.toFixed(1)
	if (/\.0$/.test(formatted))
	formatted = formatted.substr(0, formatted.length - 2)
	return formatted + tag
}
exports.uploadImage = async(buffer) => {
	const { ext } = await fromBuffer(buffer)
	let form = new FormData
	form.append('file', buffer, 'tmp.' + ext)
	let res = await fetch('https://telegra.ph/upload', {
		method: 'POST',
		body: form
	})
	let img = await res.json()
	if (img.error) throw img.error
	return 'https://telegra.ph' + img[0].src
} 