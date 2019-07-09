
require('../lib/midly.js')()
.use((req, res, ctx) => {
	ctx.error('error1')
	ctx.errors.push(new Error('custom'))
	ctx.error('error2', 404)
	res.body = 'Hello world!' // it will be replaced
})
.use((req, res, ctx) => {
	ctx.error('error3')
	throw ctx.error('error4')
	// never run
	ctx.error('error5')
})
.listen(3000)
.on('error', (req, res, ctx) => {
	console.log(ctx.errors, res.code)
	res.body = 'Oh yes, I caught them all:\n\n' + ctx.errors.join(',\n')
})
console.log('Midly started on port 3000')
