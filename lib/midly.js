
const http = require('http')
const https = require('https')
const Request = require('./request')
const Response = require('./response')
const onFinished = require('on-finished')
const destroy = require('destroy')
const {Readable} = require('stream')

module.exports = (options = {}) => new

class Midly extends (options.key && options.cert? https.Server : http.Server) {
	constructor() {
		super(options, async (req, res) => {
			req = new Request(req)
			res = new Response(res)

			req.res = res
			res.req = req

			// Context
			let ctx = {data: {}, errors: []}

			// Middleware
			try {
				for(let cb of this.middlewares) if(await cb(req, res, ctx)) break
			} catch(error) {
				ctx.errors.push(error)
				this.emit('error', req, res, ctx)
			}

			// Respond
			let body = res.body
			res.header['Content-Type'] = res.type + '; charset=' + res.charset

			if(!body || req.method == 'HEAD') return res.original.writeHead(res.code, res.headers).end()

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
		})

		this.middlewares = []
	}

	listen(port) {
		super.listen(port)
		return this
	}

	use(...cbs) {
		this.middlewares = this.middlewares.concat(cbs)
		return this
	}
}
