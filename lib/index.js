
const http = require('http')
const https = require('https')
const Request = require('./request')
const Response = require('./response')
const onFinished = require('on-finished')
const destroy = require('destroy')

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

			if(req.method != 'HEAD' && body) {
				if(body.pipe) {
					onFinished(res, e => destroy(body))
					return body.pipe(res.original)
				}

				if(!Buffer.isBuffer(body))
					try {
						body = JSON.stringify(body)
						res.type = 'application/json'
					} catch(e){debug(e)}


				res.header['content-length'] = Buffer.byteLength(body)
				res.header['content-type'] = res.type + '; charset=' + res.charset
			}
			else body = null
			
			res.original.writeHead(res.code, res.headers).end(body)
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
