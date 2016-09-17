import express from 'express'
import pg from 'pg'
import Promise from 'promise'

var app = express()

function query (sql, values = []) {
	return new Promise((resolve, reject) => {
		pg.connect(process.env.DATABASE_URL, (err, client, done) => {
			if (err) {
				console.log(err)
				done()
			}
			client.query(sql, values, (err, result) => {
				if (err) {
					reject(err)
				}
				else {
					resolve(result.rows)
				}
				done()
			})
		})
	})
}

// app.use(express.static(`${__dirname}/views`));

app.get('/', (req, res) => {
	res.status(200).sendFile(`${__dirname}/views/index.html`)
})

app.get('/users/:id', (req, res) => {
	query(`SELECT * FROM users;`).then((results) => {
		res.status(200).send(results)
	}).catch((error) => {
		res.status(400).send(error)
	})
})


app.listen(process.env.PORT, () => {
	console.log(`Server is listening on port ${process.env.PORT}`)
})