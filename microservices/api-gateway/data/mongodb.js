const { MongoClient } = require("mongodb");
require("dotenv").config();

if (!process.env.MONGODB_URI) {
	throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

// Function to establish MongoDB connection
async function connectToDatabase() {
	const uri = process.env.MONGODB_URI;
	const options = {};
	const client = new MongoClient(uri, options);
	await client.connect();
	return client.db(process.env.MONGODB_NAME);
}

module.exports = { connectToDatabase };
