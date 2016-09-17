queries = [
	`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, uuid UUID NOT NULL, name TEXT, gender TEXT, coins INT, wins INT, loses INT, class TEXT, code INT);`,
	`CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, uuid UUID NOT NULL);`,
	`CREATE TABLE IF NOT EXISTS loadouts (id SERIAL PRIMARY KEY, uuid UUID NOT NULL, user_id INT REFERENCES users(id) NOT NULL, weapon_item_id INT REFERENCES items(id) NOT NULL, armor_item_id INT REFERENCES items(id) NOT NULL, speed_item_id INT REFERENCES items(id) NOT NULL,);`,
	`CREATE TABLE IF NOT EXISTS items_purchased (id SERIAL PRIMARY KEY, uuid UUID NOT NULL, item_id INT REFERENCES items(id) NOT NULL, user_id INT REFERENCES users(id) NOT NULL);`
]