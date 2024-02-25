const fs = require("fs");
const yaml = require("yaml");

function _validateConsumerBasicAuth(userKey, userModel) {
	return new Promise((resolve, reject) => {
		userModel
			.findByBasicToken(userKey)
			.then((result) => {
				if (result) {
					resolve();
				} else {
					reject("Your key isn't valid");
				}
			})
			.catch((_) => {
				reject("Couldn't process the request at the moment");
			});
	});
}

function _parseRequest(req) {
	const ipAddress =
		(req.headers["x-forwarded-for"] || "").split(",").pop() ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
	const apiSignatureKey = req.headers["basic_auth"] || "";
	return {
		ip_address: ipAddress,
		basic_auth: apiSignatureKey,
		host: req.headers["host"],
		user_agent: req.headers["user-agent"] || "",
		method: req.method,
		path: req.path,
		originalUrl: req.originalUrl,
		query: req.query,
		params: req.params,
		app_id: req.params.path || "",
		body: req.body,
		authorization: req.headers["Authorization"] || "",
        baseUrl: req.baseUrl,
	};
}

function _parseServiceInformation(serviceName) {
	return new Promise((resolve, reject) => {
		const file = fs.readFileSync("./config.yaml", "utf8");
		const conf = yaml.parse(file);
		if (conf.services.hasOwnProperty(serviceName)) {
			resolve(conf.services[serviceName]);
		} else {
			const err = {
				type: "NOT_FOUND",
				module_source: "request_resolver",
				message: "Invalid service access. Please check your request again/",
			};
			reject(err);
		}
	});
}

function resolveRequest(req, callback) {
	const request = _parseRequest(req);

	// if (request.basic_auth === "") {
	// 	const err = {
	// 		type: "UNAUTHORIZED",
	// 		module_source: "request_resolver",
	// 		message: "Invalid API Signature Key. Please check your request again.",
	// 	};
	// 	callback(null, null, err);
	// }

	_parseServiceInformation(request.params.path || "")
		.then((service) => {
			let flag = false;

			const availableEndPoints =
				service.endpoints[request.method.toLowerCase()] || [];
			const splittedRequestPath = request.path
				.replace(/^\/|\/$/g, "")
				.split("/");
			for (let i = 0; i < availableEndPoints.length; i++) {
				let splittedEndPointPath = availableEndPoints[i]
					.replace(/^\/|\/$/g, "")
					.split("/");
				if (splittedRequestPath.length === splittedEndPointPath.length) {
					let fractalCheckFlag = true;
					for (let j = 0; j < splittedEndPointPath.length; j++) {
						if (
							splittedEndPointPath[j] !== splittedRequestPath[j] &&
							splittedEndPointPath[j] !== "*"
						) {
							fractalCheckFlag = false;
							break;
						}
					}
					if (fractalCheckFlag) {
						flag = true;
						break;
					}
				}
			}
			if (flag) {
				console.log(`For request : ${request.baseUrl}${request.path}?${new URLSearchParams(request.query)} found service : `, service);
				callback(request, service, null);
			} else {
				const err = {
					type: "NOT_FOUND",
					module_source: "request_resolver",
					message: "Request method is not found.",
				};
				callback(null, null, err);
			}
		})
		.catch((err) => {
			callback(null, null, err);
		});
}

module.exports = { resolveRequest };
