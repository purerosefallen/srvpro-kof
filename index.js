"use strict";
const srvpro = require('./srvpro');
const match = require('./match');
const coolq = require('./coolq');
const bunyan = require('bunyan');
exports.function createClient(options) {
	var client = {};
	client.log = bunyan.createLogger({
		name: "kof"
	});
	match.init(client);
	srvpro.init(client);
	coolq.init(client, options);
	return client;
}
