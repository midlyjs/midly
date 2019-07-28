
const Request = require('./request')
const Response = require('./response')
const onFinished = require('on-finished')
const destroy = require('destroy')
const {Readable} = require('stream')
const http = require('http')
const https = require('https')
const EventEmitter = require('events')

module.exports = options => new Midly(options)

class Midly extends EventEmitter {
	constructor(options = {}) {
		super()

		this.server = new ((options.key && options.cert || options.pfx)? https : http).Server(options, handler.bind(this))
		this.middlewares = []
	}

	use(...cbs) {
		this.middlewares.push(...cbs)
		return this
	}

	listen(...args) {
		this.server.listen(...args)
		return this
	}
}

async function handler(req, res) {
	req = new Request(req)
	res = new Response(res)

	req.res = res
	res.req = req

	// Context
	let ctx = {
		app: this,
		data: {},
		errors: [],
		get lastError() {
			return ctx.errors[ctx.errors.length - 1]
		},
		error(message, code) {
			if(code) res.code = code
			let error = new MidlyError(message)
			ctx.errors.push(error)
			return error
		}
	}

	// Middleware
	try {
		for(let cb of this.middlewares) if(!await cb(req, res, ctx)) break
	} catch(error) {
		if(!~ctx.errors.indexOf(error)) ctx.errors.push(error)
		if(res.code == 200) res.code = 500
		if(!this.listenerCount('error')) console.log(error)
		else this.emit('error', req, res, ctx)
	}

	// Respond
	let body = await res.body
	res.header['Content-Type'] = res.type + '; charset=' + res.charset

	res.original.emit('headers')

	if(!body || req.method == 'HEAD') return res.original.writeHead(res.code, res.headers).end()

	if(typeof body == 'number') body = body.toString()
	if(typeof body == 'string' || Buffer.isBuffer(body)) {
		res.header['Content-Length'] = Buffer.byteLength(body)
		return res.original.writeHead(res.code, res.headers).end(body)
	}

	if(body instanceof Readable) {
		onFinished(res.original, e => destroy(body))
		res.original.writeHead(res.code, res.headers)
		return body.pipe(res.original)
	}

	body = JSON.stringify(body)

	res.header['Content-Length'] = Buffer.byteLength(body)
	res.header['Content-Type'] = 'application/json; charset=' + res.charset
	
	return res.original.writeHead(res.code, res.headers).end(body)
}

class MidlyError extends Error {
	constructor(message) {
		super(message)
		this.name = 'MidlyError'
	}
}
