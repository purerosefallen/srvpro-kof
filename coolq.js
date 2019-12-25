"use strict";
const CQHttp = require('cqhttp');
const moment = require('moment');
this.init = (client, options) => { 
	client.bot = new CQHttp(options.launch);
	client.reply = (data, rep) => { 
		const send_data = {
			...data,
			message: rep,
		};
		client.bot("send_msg", send_data);
	}
	client.send_help = (data) => { 
		client.reply(data, "输入\n/create [人头赛|KOF]\nA队名 A队员1 A队员2 A队员3 ...\nB队员1 B队员2 B队员3 ...\n即可创建比赛。");
	}
	client.bot.on("message", (data) => {
		const msg = data.message.trim();
		const line = msg.split("\n");
		if (!data.group_id || !line[0] || !line[0].startsWith("/")) { 
			return;
		}
		client.log.info("message", msg);
		const parsed_msg = line[0].split(" ");
		switch (parsed_msg[0]) { 
			case "/create": {
				if (lines.length < 3) {
					client.send_help()
					return;
				}
				const time = moment();
				const is_kof = (!parsed_msg[1] || !parsed_msg[1].startsWith("人头"));
				const place = data.group_id;
				const teams = [];
				const line_txts = [];
				for (var i = 0; i < 2; ++i) { 
					const line_txt = line[i + 1];
					const temp = line_txt.split(" ");
					if (temp.length < 2) { 
						client.send_help();
						return;
					}
					line_txts.push(temp);
				}
				if (line_txts[0].length != line_txts[1].length) {
					client.reply(data, "双方队员数量不一致。");
					return;
				}
				for (var i = 0; i < 2; ++i) { 
					const team = {
						name: line_txts[i][0],
						player_names: []
					};
					for (var j = 1; j < line_txts[i].length; ++j) { 
						team.player_names.push(line_txts[i][j]);
					}
					teams.push(team);
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
	client.bot.listen(options.port, options.address);
}
