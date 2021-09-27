const {
    default: Axios
} = require('axios');

function tiktok(url) {
    return new Promise((resolve, reject) => {
        Axios.get('https://velgrynd.herokuapp.com/api/tiktok?url=' + url)
            .then(({
                data
            }) => {
                data = data.result
                let cp = `*Tiktok Downloader*\n\n`
                cp += '*ID :* ' + data.id + '\n'
                cp += '*Name / Nickname :* ' + data.username + '/' + data.nickname + '\n'
                cp += '*Durasi :* ' + data.durasi + '\n'
                cp += '*Upload :* ' + data.tanggal_buat + '\n'
                cp += '*Like :* ' + data.statistic.diggCount + '\n'
                cp += '*Komentar :* ' + data.statistic.commentCount + '\n'
                cp += '*Share :* ' + data.statistic.shareCount + '\n'
                cp += '*Tayangan :* ' + data.statistic.playCount + '\n'
                cp += '*Nama Musik :* ' + data.music.title + '\n'
                cp += '*Author Musik :* ' + data.music.authorName + '\n'
                cp += '*Deskripsi :* \n' + data.desk
                resolve({
                    nowm: data.nowm,
                    wm: data.url_with_watermark,
                    caption: cp
                })
            })
            .catch(reject)
    })
}

function tiktok2(url) {
    return new Promise((resolve, reject) => {
        Axios.get('https://velgrynd.herokuapp.com/api/tiktok2?url=' + url)
            .then(({
                data
            }) => {
                resolve(data.result.nowm)
            })
            .catch(reject)
    })
}

function pinterest(query) {
    return new Promise((resolve, reject) => {
        Axios.get('https://velgrynd.herokuapp.com/api/pinterest?query=' + encodeURIComponent(query))
            .then(({
                data
            }) => {
                resolve(data.result)
            })
            .catch(reject)
    })
}

function ghstalk(username) {
    return new Promise((resolve, reject) => {
        Axios.get('https://velgrynd.herokuapp.com/api/stalkgithub?username=' + username)
            .then(({
                data
            }) => {
                data = data.result
                let tmt = `*Github Stalk*\n\n`
                tmt += `*ID :* ${data.id}\n`
                tmt += `*Username :* ${data.login}\n`
                tmt += `*Fullname :* ${data.name}\n`
                tmt += `*Followers :* ${data.followers}\n`
                tmt += `*Following :* ${data.following}\n`
                tmt += `*Post Count :* ${data.public_repos}\n`
                tmt += `*Blog :* ${data.blog}\n`
                tmt += `*Bio :* \n${data.bio}`
                resolve({
                    image: data.avatar_url,
                    caption: tmt
                })
            })
            .catch(reject)
    })
}

function igdl(url) {
    return new Promise((resolve, reject) => {
        Axios.get('https://velgrynd.herokuapp.com/api/igdl?url=' + url)
            .then(({
                data
            }) => {
                resolve(data.result.link)
            })
            .catch(reject)
    })
}

module.exports = {
    tiktok,
    tiktok2,
    pinterest,
    ghstalk,
    igdl
}