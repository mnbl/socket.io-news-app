"use strict";
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

function createConnection() {
	return mongoose.createConnection("mongodb://localhost/socket-io-news-app", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	});
}
module.exports.on = createConnection;
