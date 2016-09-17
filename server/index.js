import express from 'express'

var app = express()

app.use(express.static(`${__dirname}/views`));

app.get('/', (req, res) => {
	res.render(`${__dirname}/views/index.html`)
})

app.listen(3000, () => {
	console.log('Server is listening on port 3000')
})