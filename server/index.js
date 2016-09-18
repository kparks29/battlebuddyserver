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
		if (parseInt(results[0].count) === 0) {
			return random
		} else {
			return getRandom()
		}
	})
}

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
})

app.use(express.static(`${__dirname}/views`));

app.get('/', (req, res) => {
	res.status(200).sendFile(`${__dirname}/views/index.html`)
})

app.get('/users/:id', (req, res) => {
	let user;

	query(`SELECT id, name, gender, coins, wins, loses, type, code, equiped_loadout_index FROM users WHERE code=$1 LIMIT 1;`, [parseInt(req.params.id)]).then((results) => {
		user = results[0]
		return query(`SELECT id, weapon_item_id, armor_item_id, speed_item_id, name FROM loadouts WHERE user_id=$1;`, [user.id])
	}).then((results) => {
		user.loadouts = results
		delete user.id
		res.status(200).send(user)
	}).catch((error) => {
		res.status(400).send(error)
	})
})

app.post('/users', (req, res) => {
	let code,
		user;

	console.log(req)

	if (!req.body.type) {
		res.status(400).send('Missing type')
	}

	getRandom().then((results) => {
		code = results
	return query(`INSERT INTO users (name, gender, coins, wins, loses, type, code, equiped_loadout_index) VALUES ($1, $2, 1000, 0, 0, $3, $4, 0);`, [req.body.name || null, req.body.gender || null, req.body.type, code])
	}).then(() => {
		return query(`SELECT id, name, gender, coins, wins, loses, type, code, equiped_loadout_index FROM users WHERE code=$1 LIMIT 1;`, [code])
	}).then((results) => {
		user = results[0]
		return query(`INSERT INTO loadouts (user_id) VALUES($1);`, [user.id])
	}).then(() => {
		return query(`INSERT INTO loadouts (user_id) VALUES($1);`, [user.id])
	}).then(() => {
		return query(`INSERT INTO loadouts (user_id) VALUES($1);`, [user.id])
	}).then(() => {
		return query(`SELECT id, weapon_item_id, armor_item_id, speed_item_id, name FROM loadouts WHERE user_id=$1;`, [user.id])
	}).then((results) => {
		user.loadouts = results
		delete user.id
		res.status(200).send(user)
	}).catch((error) => {
		res.status(400).send(error)
	})
})

app.post('/users/:id/purchase', (req, res) => {
	let coins,
		userId,
		user;

	if (!req.query.item) {
		res.status(400).send('Missing Query Param Item')
	}

	if (!req.params.id) {
		res.status(400).send('Missing Param Id')	
	}

	query(`SELECT id, coins FROM users WHERE code=$1 LIMIT 1;`, [parseInt(req.params.id)]).then((results) => {
		userId = results[0].id
		coins = results[0].coins
		return query(`INSERT INTO items_purchased (user_id, item_id) VALUES($1, $2);`, [userId, parseInt(req.query.item)])
	}).then(() => {
		return query(`SELECT cost FROM items WHERE id=$1;`, [parseInt(req.query.item)])
	}).then((results) => {
		return query(`UPDATE users SET coins=$1 WHERE id=$2;`, [coins - results[0].cost, userId])
	}).then(() => {
		return query(`SELECT id, name, gender, coins, wins, loses, type, code, equiped_loadout_index FROM users WHERE id=$1 LIMIT 1;`, [userId])
	}).then((results) => {
		user = results[0]
		return query(`SELECT id, weapon_item_id, armor_item_id, speed_item_id, name FROM loadouts WHERE user_id=$1;`, [user.id])
	}).then((results) => {
		user.loadouts = results
		delete user.id
		res.status(200).send(user)
	}).catch((error) => {
		res.status(400).send(error)
	})
})

app.get('/items', (req, res) => {
	if (!req.query.category) {
		res.status(400).send('Missing Query Param Category')
	}

	query(`SELECT * FROM items WHERE category=$1;`, [req.query.category]).then((results) => {
		res.status(200).send({ items: results })
	}).catch((error) => {
		res.status(400).send(error)
	})
})

app.get('/users/:id/items', (req, res) => {
	if (!req.params.id) {
		res.status(400).send('Missing Param Id')	
	}

	query(`SELECT DISTINCT i.* FROM items AS i
		JOIN items_purchased AS ip
		ON ip.item_id=i.id
		JOIN users AS u
		ON ip.user_id=u.id
		WHERE u.code=$1;`, [parseInt(req.params.id)]).then((results) => {
		res.status(200).send(results)
	}).catch((error) => {
		res.status(400).send(error)
	})
})

app.put('/users/:id/loadout/:loadoutId', (req, res) => {
	if (!req.params.id || !req.params.loadoutId) {
		res.status(400).send('Missing Param Id')	
	}

	if (!req.body.weapon_item_id || !req.body.armor_item_id || !req.body.speed_item_id) {
		res.status(400).send('Missing Items')	
	}

	query(`SELECT id FROM users WHERE code=$1 LIMIT 1;`, [parseInt(req.params.id)]).then((results) => {
		let userId = results[0].id
		return query(`UPDATE loadouts SET user_id=$1, weapon_item_id=$2, armor_item_id=$3, speed_item_id=$4, name=$5 WHERE id=$6;`, [userId, req.body.weapon_item_id, req.body.armor_item_id, req.body.speed_item_id, req.body.name, parseInt(req.params.loadoutId)])
	}).then(() => {
		res.status(200).send('Success')
	}).catch((error) => {
		res.status(400).send(error)
	})
})

app.put('/users/:id', (req, res) => {
	let promise,
		user;

	if (req.query.query === 'coins') {
		promise = query(`UPDATE users SET coins=$1;`, [req.body.coins])
	} else if (req.query.query === 'loadout') {
		promise = query(`UPDATE users SET equiped_loadout_index=$1;`, [req.body.equiped_loadout_index])
	}

	promise.then(() => {
		return query(`SELECT id, name, gender, coins, wins, loses, type, code, equiped_loadout_index FROM users WHERE code=$1 LIMIT 1;`, [parseInt(req.params.id)])
	}).then((results) => {
		user = results[0]
		return query(`SELECT id, weapon_item_id, armor_item_id, speed_item_id, name FROM loadouts WHERE user_id=$1;`, [user.id])
	}).then((results) => {
		user.loadouts = results
		delete user.id
		res.status(200).send(user)
	}).catch((error) => {
		res.status(400).send(error)
	})
})


app.listen(process.env.PORT || 5000, () => {
	console.log(`Server is listening on port ${process.env.PORT}`)
})