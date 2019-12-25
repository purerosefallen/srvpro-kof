"use strict";
const srvpro = require('./srvpro');
const match = require('./match');
const coolq = require('./coolq');
const bunyan = require('bunyan');
exports.createClient = (options) => {
	var client = {};
	client.log = bunyan.createLogger({
		name: "kof"
	});
	client.options = options;
	match.init(client);
	srvpro.init(client);
	coolq.init(client);
	return client;
}
