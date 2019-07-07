
let Cookies = require('cookies')

module.exports = (keys, options = {}) => {
	// cookie name
	let name = options.name || 'session'

	// secrets
	if(typeof keys == 'string') keys = [keys]
	if(!keys && options.secret) keys = [options.secret]

	// defaults
	options.overwrite = options.overwrite || true
	options.signed = options.signed || true

	if(!keys && options.signed) throw new Error('keys required')

	return (req, res, ctx) => {
		let session = ctx.cookies.get(name, options)
		ctx.session = session? JSON.parse(Buffer.from(session, 'base64').toString('utf8')): {}

		res.original.on('headers', () => ctx.cookies.set(name, Buffer.from(JSON.stringify(ctx.session)).toString('base64'), options))
	}
}