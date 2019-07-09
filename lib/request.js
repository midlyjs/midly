
const {parse} = require('querystring')
const fresh = require('fresh')
const Negotiator = require('negotiator')

function contentType(header = '') {
	if(header) header = /([^;]+);? ?(?:charset=(.*))?/.exec(header)
	return {type: header[1] || 'text/plain', charset: header[2] || 'utf-8'}
}

function negotiator(req, prop, fun) {
	req.negotiator = req.negotiator || new Negotiator(req.original)
	return rewriteProp(req, prop, req.negotiator[fun].bind(req.negotiator))
}

function rewriteProp(obj, prop, value) {
	return Object.defineProperty(obj, prop, {value})[prop]
}

module.exports = class Request {
	constructor(req) {
		this.original = req
		this.header = this.headers = req.headers
		this.method = req.method
		this.socket = req.socket
	}

	// Accepts
	get accepts() {
		return negotiator(this, 'accepts', 'mediaType')
	}

	get acceptsCharsets() {
		return negotiator(this, 'acceptsCharsets', 'charset')
	}

	get acceptsEncodings() {
		return negotiator(this, 'acceptsEncodings', 'encoding')
	}

	get acceptsLanguages() {
		return negotiator(this, 'acceptsLanguages', 'language')
	}

	// Url
	get url() {
		return this.url = decodeURI(this.original.url)
	}
	set url(value) {
		return rewriteProp(this, 'url', value)
	}

	// Path
	get path() {
		let queryPos = this.url.indexOf('?')
		return this.path = ~queryPos? this.url.substr(0, queryPos) : this.url
	}
	set path(value) {
		return rewriteProp(this, 'path', value)
	}

	// Query
	get query() {
		let queryPos = this.url.indexOf('?')
		return this.query = ~queryPos? parse(this.url.substr(queryPos + 1)) : {}
	}
	set query(value) {
		return rewriteProp(this, 'query', value)
	}

	// Fresh
	get fresh() {return fresh(this.headers, this.res.headers)}
	get stale() {return !fresh(this.headers, this.res.headers)}

	// Charset
	get charset() {
		let {type, charset} = contentType(this.header['content-type'])
		this.type = type
		return this.charset = charset
	}
	set charset(value) {
		return rewriteProp(this, 'charset', value)
	}

	// Type
	get type() {
		let {type, charset} = contentType(this.header['content-type'])
		this.charset = charset
		return this.type = type
	}
	set type(value) {
		return rewriteProp(this, 'type', value)
	}
}
