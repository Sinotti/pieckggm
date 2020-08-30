const Roll = require('roll');
module.exports = {
	name: 'roll',
	args: true,
	description: 'Rola udados.',
	aliases: ['r'],
	usage: '[1d20+atributos.. no exemplo seria jogado um dado de 20 lados + algum atributo/modificador. caso queira outro dado ou mais jogadas use 2d15+atributos(nao use espaços ou pode dar erro)]',
	cooldown: 2,
	execute(message, args) {
		console.log(args[0]);
		const anterro = args[0].split(' ');
		if(parseInt(anterro[0]) > 100 || parseInt(anterro[0] > 1000)) {
			message.channel.send('**Olha o Engraçadinho tentando me derubar kkk vai sonhando**');
			return;
		}
		const roll = new Roll();
		console.log(args[0]);
		const result = roll.roll(args[0]);
		const dados = result.rolled.join(', ');
		const resultado = result.result;
		message.channel.send({
			'embed': {
				'title': 'Dado :game_die:',
				'description': `Os dados foram (**${dados}**)\ne o resultado foi **${resultado}**`,
				'color': '65535',
			},
		});
	},
};