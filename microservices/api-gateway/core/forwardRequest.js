const axios = require("axios").default;
const jwt = require("jsonwebtoken");
require("dotenv").config();

function __generateGatewaySignature(serviceSecretKey, callback) {
	jwt.sign(
		{
			gateway: "TheBookStore",
			gateway_secret: process.env.SECRET_KEY,
		},
		serviceSecretKey,
		callback
	);
}

function forwardRequest(request, service) {
	return new Promise((resolve, reject) => {
		const method = request.method.toLowerCase();
		if (process.env.SECRET_KEY != undefined) {
			__generateGatewaySignature(service.secret_key, (err, token) => {
				if (err) {
					reject(err);
				}
				if (method === "get") {
					axios({
						method: method,
						baseURL: service.base_url + ":" + service.port,
						url:  `${request.baseUrl}${request.path}?${new URLSearchParams(request.query)}`, // Combine URL and query parameters
                        responseType: "json",
						headers: {
							gateway_signature: token,
							authorization: request.authorization,
						},
					})
						.then((response) => {
                            console.log(`For request : ${request.baseUrl}${request.path}?${new URLSearchParams(request.query)} got response : `, response);
							resolve(response.data);
						})
						.catch((err) => {
                            console.log(`For request : ${request.baseUrl}${request.path}?${new URLSearchParams(request.query)} got error : `, err);
							reject(err);
						});
				} else {
					axios({
						method: method,
						baseURL: service.base_url + ":" + service.port,
						url: request.baseUrl + request.path,
						responseType: "json",
						data: request.body,
						params: request.params,
						headers: {
							gateway_signature: token,
							authorization: request.authorization,
						},
					})
						.then((response) => {
							resolve(response);
						})
						.catch((err) => {
							reject(err);
						});
				}
			});
		}else{
            reject("SECRET KEY is not defined. Please check your environment variables.");
        }
	});
}

module.exports = { forwardRequest };
