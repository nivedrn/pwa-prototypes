const { forwardRequest } = require("./core/forwardRequest.js");
const { resolveRequest } = require("./core/requestResolver.js");
const { resolveResponse } = require("./core/responseResolver.js");
const { userSignUp, userLogin } = require("./data/user.js");
const { createPaymentIntent } = require("./data/payment.js");

const router = require("express").Router();
require("dotenv").config();

router.use("/api/:path", (req, res) => {
	console.log(
		`Incoming request : ${req.baseUrl}${req.path}?${new URLSearchParams(
			req.query
		)}.`
	);

	resolveResponse(res);
	resolveRequest(req, async (request, service, error) => {
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
			console.log(request.path);
			if (request.baseUrl == "/api/auth") {
				console.log("Inside Auth");
				if (request.path == "/login") {
					console.log("Inside Login");
					const { results, error, status } = await userLogin(
						req.body.email,
						req.body.password
					);
					res
						.status(status)
						.json({
							results: results ? results : null,
							error: error ? error : null,
						});
				} else if (request.path == "/signup") {
					console.log("Inside SIgnup");
					const { results, error, status } = await userSignUp(
						req.body.name,
						req.body.email,
						req.body.password
					);
					res
						.status(status)
						.json({
							results: client_secret ? client_secret : null,
							error: error ? error : null,
						});
				}
			}else if(request.baseUrl == "/api/payment"){
                if (request.path == "/createpaymentintent") {
                    const { client_secret, error, status } = await createPaymentIntent(
						req.body.amount
					);
                    res
						.status(status)
						.json({
							client_secret: client_secret ? client_secret : null,
							error: error ? error : null,
						});
                }
            }else {
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
