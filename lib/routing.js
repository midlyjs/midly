
const path2regexp = require('path2regexp')

function Route(method, path, callback) {
	this.path = path2regexp(path)
	this.method = method.toUpperCase()
	this.callback = callback
}

module.exports = function() {
	this.routes = []
	this.middleware = []

	let self = async (req, res, ctx) => {
		req.params = []
		for(let callback of this.middleware) if(await callback(req, res, ctx)) break
		for(let route of this.routes)
			if((req.method == route.method || route.method == 'ALL') && route.path.test(req.path)) {
				Object.assign(req.params, route.path.exec(req.path))
				if(await route.callback(req, res, ctx)) break
			}
	}

 
	self.use = (...cbs) => {
		this.middleware.concat(cbs)
		return self
	}

	['get', 'post', 'put', 'patch', 'delete', 'all'].forEach(method => {
		self[method] = (path, ...cbs) => {
			this.routes = this.routes.concat(cbs.map(callback => new Route(path, method, callback)))
			return self
		}
	})

	return self
}

module.exports.Route = Route