const { forwardRequest } = require("./core/forwardRequest.js");
const { resolveRequest } = require("./core/requestResolver.js");
const { resolveResponse } = require("./core/responseResolver.js");

const router = require("express").Router();
require("dotenv").config();

router.use("/api/:path", (req, res) => {
	console.log(
		`Incoming request : ${req.baseUrl}${req.path}?${new URLSearchParams(
			req.query
		)}.`
	);

	resolveResponse(res);
	resolveRequest(req, (request, service, error) => {
		if (error) {
			let status_code;
			if (error.hasOwnProperty("type")) {
				if (error.type === "UNAUTHORIZED") {
					status_code = 401;
				} else if (error.type === "NOT_FOUND") {
					status_code = 404;
				} else {
					status_code = 500;
				}
			} else {
				status_code = 500;
			}
			res.status(status_code).json(error);
		} else {
			if (request.path == "auth") {
                console.log("Inside Auth");
			} else {
				forwardRequest(request, service)
					.then((response) => {
						res.json(response);
					})
					.catch((err) => {
						res.status(500).json(err);
					});
			}
		}
	});
});

router.use((req, res) => {
	res.status(200).send("API Gateway is running");
});

module.exports = router;
