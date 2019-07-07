
const {IncomingForm} = require('formidable')

module.exports = (req, res, ctx) => new Promise((resolve, reject) => {

	if(req.contentType == 'multipart/form-data' || req.contentType == 'application/x-www-form-urlencoded') {
		let form = new IncomingForm
		form.multiples = true;
		form.encoding = req.charset
		form.hash = 'md5'
		form.onPart = (part) => {
			debug(part)
		}
		form.parse(req, (err, fields, files, ...args) => {
			if(err) reject(err)
			req.body = fields
			req.files = files
			resolve()
		})
	}
	else {
		let buffer = []
		let received = 0

		req.on('aborted', onAborted)
		req.on('close', cleanup)
		req.on('data', onData)
		req.on('end', onEnd)
		req.on('error', onEnd)

		function onAborted() {
			debug(123)
		}

		function onData(chunk) {
			received += chunk.length
			if(received > limit) return onEnd(Error('request size did not match content length'))
			buffer.push(chunk)
		}

		async function onEnd(err) {
			if(err) reject(err)
			if(received) req.body = Buffer.concat(buffer).toString()
			resolve()
			cleanup()
		}

		function cleanup() {
			buffer = null

			req.removeListener('aborted', onAborted)
			req.removeListener('data', onData)
			req.removeListener('end', onEnd)
			req.removeListener('error', onEnd)
			req.removeListener('close', cleanup)
		}
	}
})