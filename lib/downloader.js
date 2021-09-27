let nhentai = require('nhentai-node-api')
let topdf = require('image-to-pdf')
let request = require('request')
let fs = require('fs-extra')
let got = require('got')

exports.NhentaiDl = async(m, args, utils) => {
	if (!args[0]) return m.reply(`Penggunaan nhentai 298547`)
	if (isNaN(args[0])) return m.reply('Pake angka')
	await m.reply('Loading...')
	let count = 0
	let ResultPdf = []
	let doujin = await nhentai.getDoujin(args[0])
	let title = doujin.title.default
	let details = doujin.details
	let parodies = details.parodies.map(v => v.name)
	let characters = details.characters.map(v => v.name)
	let tags = details.tags.map(v => v.name)
	let artists = details.artists.map(v => v.name)
	let groups = details.groups.map(v => v.name)
	let categories = details.categories.map(v => v.name)
	let array_page = doujin.pages
	
	await conn.sendFile(m.chat, array_page[0], '', `*${title}*\n_${doujin.title.native || ''}_\n• Language: ${doujin.language}\n• Parodies: ${parodies.join(', ')}\n• Groups: ${groups.join(', ')}\n• Artists: ${artists.join(', ')}\n• Tags: ${tags.join(', ')}\n• Categories: ${categories.join(', ')}\n• Pages: ${array_page.length}\n• Favorited: ${doujin.favorites}\n• Link: ${doujin.link.replace('nhentai.net/g', 'cin.pw/v')}`, m)

	for (let i = 0; i < array_page.length; i++) {
		if (!fs.existsSync('./nhentai')) fs.mkdirSync('./nhentai')
		let image_name = './nhentai/' + title + i + '.jpg'
		await new Promise((resolve) => request(array_page[i]).pipe(fs.createWriteStream(image_name)).on('finish', resolve))
		console.log(array_page[i])
		ResultPdf.push(image_name)
		count++
	}

	await new Promise((resolve) =>
		topdf(ResultPdf, 'A4')
		.pipe(fs.createWriteStream('./nhentai/' + title + '.pdf'))
		.on('finish', resolve)
	)
	
	for (let i = 0; i < array_page.length; i++) {
		fs.unlink('./nhentai/' + title + i + '.jpg')
	}
	
	let size = await fs.statSync(`./nhentai/${title}.pdf`).size
	if (size < 45000000) {
		m.reply('Uploading...')
		let thumbnail = await utils.getBuffer(doujin.cover)
		await conn.sendFile(m.chat, fs.readFileSync(`./nhentai/${title}.pdf`), `${title}.pdf`, '', m, false, { asDocument: true, thumbnail: thumbnail })
		.then(() => fs.unlinkSync(`./nhentai/${title}.pdf`))
	} else {
		m.reply('Uploading to anonfiles because file size to large')
		let options = {
			method: 'POST',
			url: 'https://api.anonfiles.com/upload',
			formData: {
				file: fs.createReadStream(`./nhentai/${title}.pdf`),
			},
		}

	request(options, function(err, res, body) {
		if (err) return m.reply(String(err))
		fs.unlinkSync(`./nhentai/${title}.pdf`)
		m.reply('Link download to file: ' + JSON.parse(body).data.file.url.full)
		})
	}
}

exports.igDownloader = (url) => new Promise(async (resolve, reject) => {
	try {
		const uri = url.replace(/\?.*$/g, '') + '?__a=1'
		const data = await got.get(uri).json()
		if (data.hasOwnProperty('graphql')) {
			const type = data.graphql.shortcode_media.__typename
			const metadata = {
				type,
				username: data.graphql.shortcode_media.owner.username,
				full_name: data.graphql.shortcode_media.owner.full_name,
				like: data.graphql.shortcode_media.edge_media_preview_like.count,
				caption: data.graphql.shortcode_media.edge_media_to_caption.edges[0].node.text,
				url: []
			}
			if (type === 'GraphImage') {
				metadata.url.push(data.graphql.shortcode_media.display_url)
			} else if (type === 'GraphVideo') {
				metadata.url.push(data.graphql.shortcode_media.video_url)
			} else if (type === 'GraphSidecar') {
				data.graphql.shortcode_media.edge_sidecar_to_children.edges.map((r) => {
					if (r.node.__typename === 'GraphImage') metadata.url.push(r.node.display_url)
					if (r.node.__typename === 'GraphVideo') metadata.url.push(r.node.video_url)
				})
			}
			resolve(metadata)
		} else {
			reject(new Error('User is private or post not found'))
		}
	} catch (e) {
		reject(new Error(e))
	}
})