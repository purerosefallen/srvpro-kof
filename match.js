"use strict";
function shuffle(arr) {
	for (let i=arr.length-1; i>=0; i--) {
		let rIndex = Math.floor(Math.random()*(i+1));
		let temp = arr[rIndex];
		arr[rIndex] = arr[i];
		arr[i] = temp;
	}
	return arr;
}
function lookup(list, id) { 
	for (var obj of list) { 
		if (id === obj.id) { 
			return obj;
		}
	}
	return null;
}
this.init = (client) => { 
	client.id = 0;
	client.users = [];
	client.kofs = [];
	client.duels = [];
	client.send_format_kof = (kof) => {
		var ret = 	"战队：" + kof.teams[0].name + " VS " + kof.teams[1].name + "\n" +
					"时间：" + kof.time.format("YYYY.MM.DD") + "\n" +
					"规则：" + (kof.is_kof ? "2/3【KOF】" : "人头赛") + "\n" +
					"地点：" + kof.chat.group_id + "\n" + 
			"------第一轮------" + "\n";
		for (var duel of kof.rounds[0]) { 
			ret += lookup(client.users, duel.players[0]).name + "  " + duel.scores[0] + ":" + duel.scores[1] + "  " + lookup(client.users, duel.players[1]).name + "\n";
		}
		ret += "------第二轮------";
		for (var i = 1; i < kof.rounds.length; ++i) {
			const round = kof.rounds[i];
			for (var duel of round) { 
				ret += "\n" + lookup(client.users, duel.players[0]).name + "  " + duel.scores[0] + ":" + duel.scores[1] + "  " + lookup(client.users, duel.players[1]).name;
			}
		}
		client.reply(kof.chat, ret);
	}
	client.get_player = (name) => { 
		for (var user of client.users) { 
			if (user.name === name) { 
				return user;
			}
		}
		var new_user = {
			name: name,
			id: ++client.id
		}
		client.users.push(new_user);
		client.log.info("new user", new_user.id, new_user.name);
		return new_user;
	}
	client.check_player_unique = (player) => { 
		for (var kof of client.kofs) { 
			if (kof.finished) {
				continue;
			}
			for (var team of kof.teams) { 
				for (var exist_id of team.players) { 
					if (player.id === exist_id) { 
						return false;
					}
				}
			}
		}
		return true;
	}
	client.is_player_available = (kof, id) => { 
		for (var round of kof.rounds) { 
			for (var duel of round) { 
				if ((duel.players[0] === id || duel.players[1] === id) && ((duel.state === "complete" && duel.winner !== id && duel.winner !== "tie") || duel.state === "pending")) { 
					return false;
				}
			}
		}
		return true;
	}
	client.create_duel = (kof, player1, player2) => { 
		var duel = {
			id: ++client.id,
			belongs_to: kof.id,
			players: [
				player1,
				player2
			],
			scores: [0, 0],
			winner: null,
			state: "pending"
		}
		client.duels.push(duel);
		client.log.info("duel created", duel.id, kof.id, player1, player2);
		return duel;
	}
	client.create_round = (kof) => { 
		var ready_players = []
		for (var i = 0; i < 2; ++i) { 
			var list = [];
			for (var player of kof.teams[i].players) { 
				if (client.is_player_available(kof, player)) {
					list.push(player);
				}
			}
			if (!list.length) { 
				return false;
			}
			shuffle(list);
			ready_players.push(list);
		}
		const count = Math.min(ready_players[0].length, ready_players[1].length);
		var round = [];
		for (var i = 0; i < count; ++i) { 
			const duel = client.create_duel(kof, ready_players[0][i], ready_players[1][i]);
			round.push(duel);
		}
		kof.rounds.push(round);
		client.log.info("round created", kof.id, kof.rounds.length);
		return round;
	}
	client.create_kof = (chat, teams, time, place, options) => { 
		var kof = {
			id: ++client.id,
			time: time,
			place: place,
			is_kof: options.is_kof,
			chat: chat,
			teams: teams,
			rounds: []
		}
		for (var team of teams) { 
			team.players = [];
			for (var player_name of team.player_names) { 
				const player = client.get_player(player_name);
				if (!options.dry_run && !client.check_player_unique(player)) { 
					client.reply(chat, "无法创建比赛。玩家 " + player.name + "正在进行其他比赛。");
					return false;
				}
				team.players.push(player.id);
			}
		}
		client.log.info("kof created", kof.id, place, options.is_kof, teams[0].name, teams[1].name);
		client.kofs.push(kof);
		client.create_round(kof);
		if (!options.dry_run) { 
			client.reply(chat, "比赛创建成功。请双方队员进入服务器 " + client.options.server_ip + " " + client.options.server_port + " 参加比赛。");
		}
		client.send_format_kof(kof);
		if (options.dry_run) { 
			client.delete_kof(kof);
			return null;
		}
		return kof;
	}
	client.is_all_duels_finished = (kof) => { 
		for (var round of kof.rounds) { 
			for (var duel of round) { 
				if (duel.state !== "complete") { 
					return false;
				}
			}
		}
		return true;
	}
	client.delete_duel = (duel) => { 
		const index = client.duels.indexOf(duel)
		if (index !== -1) { 
			client.duels.splice(index, 1);
		} 
	}
	client.delete_kof = (kof) => { 
		for (var round of kof.rounds) { 
			for (var duel of round) { 
				client.delete_duel(duel);
			}
		}
		const index = client.kofs.indexOf(kof);
		if (index !== -1) { 
			client.kofs.splice(index, 1);
		}
	}
	client.update_duel = (id, score1, score2, winner) => { 
		var duel = lookup(client.duels, id);
		var kof = lookup(client.kofs, duel.belongs_to);
		duel.scores[0] = score1;
		duel.scores[1] = score2;
		client.log.info("score updated", id, score1, score2, winner);
		if (winner) { 
			duel.winner = winner;
			duel.state = "complete";
			if (kof.is_kof) { 
				client.create_round(kof);
			}
			if (client.is_all_duels_finished(kof)) { 
				kof.finished = true;
				client.reply(kof.chat, "比赛结束。");
			}
			client.send_format_kof(kof);
			if (kof.finished) { 
				client.log.info("kof finished", kof.id);
				client.delete_kof(kof);
			}
		}
	}
}
