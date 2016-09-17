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
		console.log(parseInt(results[0].count), random)
		if (parseInt(results[0].count) === 0) {
			return random
		} else {
			return getRandom()
		}
	})
}

app.use(bodyParser.json())
// app.use(express.static(`${__dirname}/views`));

app.get('/', (req, res) => {
	getRandom().then((code) => {
		res.status(200).send(code)
	}).catch((err) => {
		res.status(200).send(err)
	})
	// res.status(200).sendFile(`${__dirname}/views/index.html`)
})

app.get('/users/:id', (req, res) => {
	let user;

	query(`SELECT name, gender, coins, wins, loses, class, code FROM users WHERE code=$1 LIMIT 1;`, [req.params.id]).then((results) => {
		console.log(results)
		res.status(200).send(results)
	}).catch((error) => {
		res.status(400).send(error)
	})
})

app.post('/users', (req, res) => {
	let code,
		user;

	if (!req.body.class) {
		res.status(400).send('Missing Class')
	}

	getRandom().then((results) => {
		code = results
		return query(`INSERT INTO users (name, gender, coins, wins, loses, class, code) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [req.body.name || null, req.body.gender || null, 1000, 0, 0, req.body.class], code)
	}).then(() => {
		return query(`SELECT name, gender, coins, wins, loses, class, code FROM users WHERE code=$1 LIMIT 1;`, [code])
	}).then((results) => {
		console.log(results)
		user = results
		// return query(`SELECT weapon_item_id, armor_item_id, speed_item_id FROM loadouts WHERE user_id=$1;`, [user.id])
		// }).then((results) => {
			// user.loadouts = results
			// delete user.id
		// })
		// res.status(200).send(user)
		res.status(200).send(results)
	}).catch((error) => {
		res.status(400).send(error)
	})
})


app.listen(process.env.PORT || 5000, () => {
	console.log(`Server is listening on port ${process.env.PORT}`)
})