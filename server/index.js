import express from 'express'
import pg from 'pg'
import Promise from 'promise'


process.env.PORT = process.env.PORT || 5000
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://ifnzrvwijvvxds:7abTa8XKGz9LgMl_aOWPSBdta7@ec2-54-225-81-90.compute-1.amazonaws.com:5432/d33ga0ododnh4n'


var app = express()

// app.use(express.static(`${__dirname}/views`));

app.get('/users', (req, res) => {
	query(`SELECT * FROM users;`).then((results) => {
		res.status(200).send(results)
	}).catch((error) => {
		res.status(400).send(error)
	})
})


app.listen(process.env.PORT, () => {
	console.log(`Server is listening on port ${process.env.PORT}`)
})

function query (sql, values = []) {
	console.log('query')
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