"use strict";
this.init = (client) => { 
	client.participants = {};
	client.matches = {};
	client.participants.index = (data) => { 
		var ret = [];
		for (var user of client.users) { 
			ret.push({
				participant: {
					id: user.id,
					name: user.name
				}
			});
		}
		data.callback(null, ret);
	}
	client.matches.index = (data) => { 
		var ret = [];
		for (var duel of client.duels) { 
			if (duel.state !== "complete") { 
				ret.push({
					match: {
						id: duel.id,
						player1Id: duel.players[0].id,
						player2Id: duel.players[1].id,
						winnerId: duel.winner,
						state: duel.state
					}
				});
			}
		}
		data.callback(null, ret);
	}
	client.matches.update = (data) => { 
		const id = data.matchId;
		const result = data.match;
		const scores = result.scoresCsv.split("-");
		const score1 = parseInt(scores[0]);
		const score2 = parseInt(scores[1]);
		const winner = data.winner;
		client.update_duel(id, score1, score2, winner);
	}
}
