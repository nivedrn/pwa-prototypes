require("dotenv").config();
const cors = require("cors");

const express = require("express");
const middleware = require("./middleware");
const PORT = process.env.PORT;

const app = express();
app.use(express.json());

app.use(
	cors({
		origin: process.env.CLIENT_URL,
	})
);

app.use(middleware);

app.listen(PORT, () => {
	console.log(`API Gateway is running on port http://localhost:${PORT}`);
});
