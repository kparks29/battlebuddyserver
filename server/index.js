import express from 'express'
import pg from 'pg'
import Promise from 'promise'
import bodyParser from 'body-parser'

var app = express()

function query (sql, values = []) {
	return new Promise((resolve, reject) => {
		pg.connect(process.env.DATABASE_URL ||'postgres://ifnzrvwijvvxds:7abTa8XKGz9LgMl_aOWPSBdta7@ec2-54-225-81-90.compute-1.amazonaws.com:5432/d33ga0ododnh4n', (err, client, done) => {
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

function getRandom () {
	let random = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
	return query(`SELECT COUNT(*) AS count FROM users WHERE code=$1`, [random]).then((results) => {
		console.log(results)
	})
}

app.use(bodyParser.json())
app.use(express.static(`${__dirname}/views`));

app.get('/', (req, res) => {
	getRandom()
	res.status(200).sendFile(`${__dirname}/views/index.html`)
})

app.get('/users/:id', (req, res) => {
	let user;

	query(`SELECT name, gender, coins, wins, loses, class FROM users WHERE code=$1 LIMIT 1;`, [req.params.id]).then((results) => {
		console.log(results)
		res.status(200).send(results)
	}).catch((error) => {
		res.status(400).send(error)
	})
})

app.post('/users', (req, res) => {
	if (!req.body.class) {
		res.status(400).send('Missing Class')
	}


	query()

	query(`INSERT INTO users (name, gender, coins, wins, loses, class) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.name || null, req.body.gender || null, 1000, 0, 0, req.body.class]).then(() => {
		return query(`SELECT`)
	}).then((results) => {
		console.log(results)
		res.status(200).send(results)
	}).catch((error) => {
		res.status(400).send(error)
	})
})


app.listen(process.env.PORT || 5000, () => {
	console.log(`Server is listening on port ${process.env.PORT}`)
})