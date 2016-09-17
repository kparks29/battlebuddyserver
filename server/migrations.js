import pg from 'pg'
import Promise from 'promise'

var pool = new pg.Pool({
	host: process.env.PGHOST,
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	port: process.env.PGPORT,
	database: process.env.PGDATABASE
})

function Query (sql, values = []) {
	return new Promise((resolve, reject) => {
		pool.connect((err, client, done) => {
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

let promises = [],
	queries = [
		`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			uuid UUID NOT NULL,
			name TEXT,
			gender TEXT,
			coins INT,
			wins INT,
			loses INT,
			class TEXT,
			hashed_password VARCHAR(36),
			salt UUID,
			email TEXT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS items (
			id SERIAL PRIMARY KEY,
			uuid UUID NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS loadouts (
			id SERIAL PRIMARY KEY,
			uuid UUID NOT NULL,
			user_id INT REFERENCES users(id) NOT NULL,
			weapon_item_id INT REFERENCES items(id) NOT NULL,
			armor_item_id INT REFERENCES items(id) NOT NULL,
			speed_item_id INT REFERENCES items(id) NOT NULL,
		);`,
		`CREATE TABLE IF NOT EXISTS items_purchased (
			id SERIAL PRIMARY KEY,
			uuid UUID NOT NULL,
			item_id INT REFERENCES items(id) NOT NULL,
			user_id INT REFERENCES users(id) NOT NULL
		);`
	]

for (let query of queries) {
	promises.push(Query(query.sql, []))
}

Promise.all(promises).then(() => {
	console.log('Migrations Complete')
}).catch((err) => {
	console.log(err)
})