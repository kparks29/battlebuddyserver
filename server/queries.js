queries = [
	`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, gender TEXT, coins INT, wins INT, loses INT, type TEXT, code INT, equiped_loadout_index INT);`,
	`CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, name TEXT, category TEXT, description TEXT, cost INT, damage INT, range INT, spread DECIMAL, speed INT, health INT, multiplier DECIMAL, effect DECIMAL, cooldown INT);`,
	`CREATE TABLE IF NOT EXISTS loadouts (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) NOT NULL, weapon_item_id INT REFERENCES items(id), armor_item_id INT REFERENCES items(id), speed_item_id INT REFERENCES items(id), name TEXT);`,
	`CREATE TABLE IF NOT EXISTS items_purchased (id SERIAL PRIMARY KEY, item_id INT REFERENCES items(id) NOT NULL, user_id INT REFERENCES users(id) NOT NULL);`
]