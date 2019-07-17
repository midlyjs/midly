
<div align="center">

![Midly Logo](https://github.com/midlyjs/midly/raw/master/midly.logo.png)<br>Must kill koa)</div>

```js
require('midly')()
.use((req, res, ctx) => {
  res.body = 'Hello world!'
})
.listen(3000)
console.log('Midly started on port 3000')
```

## Installation

From npm registry:
```bash
$ npm install midly
```

## Documentation

U can find the latest documentation [here](https://github.com/midlyjs/midly/wiki)
