
const {extname} = require('path')

module.exports = class Response {
	constructor(res) {
		this.original = res
		this.header = this.headers = {}
		this.socket = res.socket
		this.code = 200
		this.type = 'text/html'
		this.charset = 'utf-8'
	}

	redirect(url) {
		this.header['Location'] = url
		this.body = this.body || `Redirecting to <a href="${url}">${url}</a>.`
	}

	attachment(filename) {
		this.header['Content-Disposition'] = 'attachment'
		if(filename) {
			this.type = extname(filename)
			this.header['Content-Disposition'] += '; filename="' + filename + '"'
		}
	}
}
