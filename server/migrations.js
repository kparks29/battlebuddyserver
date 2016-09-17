import pg from 'pg'
import Promise from 'promise'


process.env.PORT = process.env.PORT || 5000
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://ifnzrvwijvvxds:7abTa8XKGz9LgMl_aOWPSBdta7@ec2-54-225-81-90.compute-1.amazonaws.com:5432/d33ga0ododnh4n'

function Query (sql, values = []) {
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