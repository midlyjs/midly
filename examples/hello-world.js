
require('../lib/')()
.use((req, res, ctx) => {
	res.body = 'Hello world!'
})
.listen(3000)
console.log('Midly started on port 3000')
