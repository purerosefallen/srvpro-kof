"use strict";
const CQHttp = require('cqhttp');
const moment = require('moment');
this.init = (client) => { 
	client.bot = new CQHttp(client.options.launch);
	client.reply = (data, rep) => { 
		const send_data = {
			...data,
			message: rep,
		};
		client.bot("send_msg", send_data);
	}
	client.send_help = (data) => { 
		client.reply(data,
			"输入" + "\n" +
			"/create 人头赛|KOF" + "\n" +
			"A队名：A队员1，A队员2，A队员3，..." + "\n" +
			"B队名：B队员1，B队员2，B队员3，..." + "\n" +
			"即可创建比赛。"
		);
	}
	client.bot.on("message", (data) => {
		const msg = data.message.trim();
		const lines = msg.split("\r\n");
		if (!data.group_id || !lines[0] || !lines[0].startsWith("/")) { 
			return;
		}
		client.log.info("message", msg);
		const parsed_msg = lines[0].split(/ +/);
		switch (parsed_msg[0]) { 
			case "/create": {
				if (lines.length < 3) {
					client.send_help(data)
					return;
				}
				const time = moment();
				const is_kof = (!parsed_msg[1] || !parsed_msg[1].startsWith("人头"));
				const place = data.group_id;
				const teams = [];
				for (var i = 0; i < 2; ++i) { 
					const line_txt = lines[i + 1].trim();
					const temp1 = line_txt.match(/^(.+?)[:\uff1a](.+)$/);
					if (!temp1) { 
						client.send_help(data);
						return;
					}
					const team_name = temp1[1].trim();
					const team_player_names = temp1[2].trim().split(/[,\uff0c]+/);
					if (!team_player_names.length) { 
						client.send_help(data);
						return;
					}
					teams.push({
						name: team_name,
						player_names: team_player_names
					});
				}
				if (teams[0].player_names.length != teams[1].player_names.length) {
					client.reply(data, "双方队员数量不一致。");
					return;
				}
				client.create_kof(data, teams, time, place, is_kof);
				break;
			}
			default: { 
				client.send_help(data);
				break;
			}
		}
	});
	if (client.options.auto_accept_request) { 
		client.bot.on("request", (data) => { 
			if (data.request_type === "friend" || (data.request_type === "group" && data.sub_type === "invite")) {
				var res = true;
				if (client.options.accept_password && data.comment !== client.options.accept_password) {
					res = false;
				}
				return {
					approve: res
				}
			}
		})
	}
	client.bot.listen(client.options.port, client.options.address);
}
