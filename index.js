const fs = require('fs');
const Discord = require('discord.js');

const Youtube = require('simple-youtube-api');
const Ytdl = require('ytdl-core');
const online = 1;
let connection;
const cooldowns = new Discord.Collection();
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./comandos').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./comandos/${file}`);
	client.commands.set(command.name, command);
}

// eslint-disable-next-line no-unused-vars
const {prefix, dono, googleAPI } = require('./config.json');
const youtube = new Youtube(googleAPI);
const filaDeMusicas = [];
let estouPronto = false;
client.once('ready', () => {
	console.log('Bot ON');
	client.user.setActivity('%help', {
		type: 'PLAYING',

	},
	);
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);

	const commandName = args.shift().toLowerCase();


	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return message.reply('O comando que você digitou ou não existe ou está errado, tente usar %help');
	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('Esse comando não funciona no chat privado');
	}
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`Por favor espere ${timeLeft.toFixed(1)} antes de usar o comando \`${command.name}\` de novo. `);
		}

	}
	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}
	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	try {
		command.execute(message, args, prefix, dono);
	}
	catch (error) {
		console.error(error);
		console.log('there was an error trying to execute that command!');
	}

},

);
process.on('unhandledRejection', error => console.error(`Uncaught Promise Rejection:\n${error}`));

client.on('message', async (msg) => {
	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	const args = msg.content.slice(prefix.length).trim().split(/ +/);

	const commandName = args.shift().toLowerCase();
	if (commandName == 'volume') {
		connection.dispatcher.setVolumeLogarithmic(args[0] / 10);
	}


	// tocar
	if (commandName == 'tocar' || commandName == 'play') {
		if (msg.member.voice.channel) {

			connection = await msg.member.voice.channel.join();

			estouPronto = true;

		}
		if (estouPronto) {

			const oQueTocar = args.join(' ');

			// tenta encontrar música por link
			try {
				const video = await youtube.getVideo(oQueTocar);
				msg.channel.send(`Encontrei o que você pediu, vou começar a tocar: ${video.title}`);
				filaDeMusicas.push(oQueTocar);
				if (filaDeMusicas.length === 1) {
					tocarMusica(msg);
				}
			}
			catch (error) {
				try {
					const videosPesquisados = await youtube.searchVideos(oQueTocar, 5);
					let videoEncontrado;
					const nomes = [];
					for (i in videosPesquisados) {
						videoEncontrado = await youtube.getVideoByID(videosPesquisados[i].id);
						nomes[i] = videoEncontrado.title;

					}
					const exampleEmbed = new Discord.MessageEmbed()
						.setColor('#3498db')
						.setTitle('Músicas encontradas: ')
						.addFields(
							{ name: `1 - ${nomes[0]}`, value: '\u200B ' },
							{ name: `2 - ${nomes[1]}`, value: '\u200B ' },
							{ name: `3 - ${nomes[2]}`, value: '\u200B ' },
							{ name: `4 - ${nomes[3]}`, value: '\u200B ' },
							{ name: `5 - ${nomes[4]}`, value: '\u200B ' },
						)
						.setImage('https://cdn.discordapp.com/attachments/425865939691765760/468946573339000852/luzinha.gif')
						.setFooter('Razer RGB Paga Nóis', `${client.user.displayAvatarURL({ format: 'png', dynamic: true })}`);
					msg.channel.send(exampleEmbed);
					msg.channel.send({
						embed: {
							color: 3447003,
							description: 'Você poderia esperar as reações aparecerem e em seguida clicar na que representa qual musica você gostaria? Assim posso saber exatamente o que você quer ^^ ',


						},
					}).then(async (embedMessage) => {
						await embedMessage.react('1️⃣');
						await embedMessage.react('2️⃣');
						await embedMessage.react('3️⃣');
						await embedMessage.react('4️⃣');
						await embedMessage.react('5️⃣');

						const filter = (reaction, user) => {
							return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(reaction.emoji.name)
								&& user.id === msg.author.id;
						};
						const collector = embedMessage.createReactionCollector(filter, { time: 20000 });
						collector.on('collect', async (reaction, reactionCollector) => {
							if (reaction.emoji.name === '1️⃣') {
								msg.channel.send('Acabei de colocar a opção 1️⃣ na fila, aproveite ^^');
								videoEncontrado = await youtube.getVideoByID(videosPesquisados[0].id);
								filaDeMusicas.push(`https://www.youtube.com/watch?v=${videoEncontrado.id}`);

							}
							else if (reaction.emoji.name === '2️⃣') {
								msg.channel.send('Acabei de colocar a opção 2️⃣ na fila, aproveite ^^');
								videoEncontrado = await youtube.getVideoByID(videosPesquisados[1].id);
								filaDeMusicas.push(`https://www.youtube.com/watch?v=${videoEncontrado.id}`);
							}
							else if (reaction.emoji.name === '3️⃣') {
								msg.channel.send('Acabei de colocar a opção 3️⃣ na fila, aproveite ^^');
								videoEncontrado = await youtube.getVideoByID(videosPesquisados[2].id);
								filaDeMusicas.push(`https://www.youtube.com/watch?v=${videoEncontrado.id}`);
							}

							else if (reaction.emoji.name === '4️⃣') {
								msg.channel.send('Acabei de colocar a opção 4️⃣ na fila, aproveite ^^');
								videoEncontrado = await youtube.getVideoByID(videosPesquisados[3].id);
								filaDeMusicas.push(`https://www.youtube.com/watch?v=${videoEncontrado.id}`);
							}

							else if (reaction.emoji.name === '5️⃣') {
								msg.channel.send('Acabei de colocar a opção 5️⃣ na fila, aproveite ^^');
								videoEncontrado = await youtube.getVideoByID(videosPesquisados[4].id);
								filaDeMusicas.push(`https://www.youtube.com/watch?v=${videoEncontrado.id}`);
							}

							if (filaDeMusicas.length === 1) {
								tocarMusica(msg);
							}

						});
					});
				}
				catch (error) {
					console.log(error);
					msg.channel.send('Não consegui encontrar nenhum video... tente de novo e verifique se há algo errado');
				}
			}
		}
		else {
			msg.channel.send('');
		}
	}

	// ////////////////////////////////////////////
	// pause
	if (commandName == 'pausar' || commandName == 'pause') {
		if (msg.member.voice.channel) {
			if (connection.dispatcher) {
				if (!connection.dispatcher.paused) {

					connection.dispatcher.pause();


					setTimeout(() => {


						while (filaDeMusicas.length > 0) {
							filaDeMusicas.shift();
						}
						msg.member.voice.channel.leave();
						estouPronto = false;
						msg.channel.send('Já que ninguém está ouvindo nada eu vou dar um saídinha, mas caso precise de mim basta chamar ');


					}, 600 * 1000);


					// //////////////
					msg.channel.send('Prontinho já pausei, basta dizer quando quiser que eu volte a tocar ^^');
				}
				else {
					msg.channel.send('A musica já está pausada, você pode ter se confundido kkk');
				}
			}
			else {
				msg.channel.send('Ah me desculpe, eu não estou tocando nada então não tenho como pausar...');
			}

		}
		else {
			msg.channel.send('Para que eu possa pausar você precisar estar na call comigo ');
		}
	}
	// sair
	if (commandName == 'sair' || commandName == 'leave') {
		if (msg.member.voice.channel) {
			msg.member.voice.channel.leave();
			estouPronto = false;

			while (filaDeMusicas.length > 0) {
				filaDeMusicas.shift();
			}
		}
	}
	// resume
	if (commandName == 'continuar' || commandName == 'continue' || commandName == 'start') {
		if (msg.member.voice.channel) {
			if (connection.dispatcher) {
				if (connection.dispatcher.paused) {

					connection.dispatcher.resume();

				}
				else {
					msg.channel.send('No momento não tem nada pausado, talvez você tenha se confundido ');
				}
			}
			else {
				msg.channel.send('Não tem nada na fila pra "voltar a tocar", tente colocar algo pra gente ouvir junto ');
			}

		}
		else {
			msg.channel.send('Para que eu possa pausar preciso que você esteja na call comigo ');
		}
	}
	// ///end
	else if (commandName == 'encerrar' || commandName == 'stop' || commandName == 'parar') {
		if (msg.member.voice.channel) {
			if (connection.dispatcher) {
				connection.dispatcher.end();
				while (filaDeMusicas.length > 0) {
					filaDeMusicas.shift();
				}

				if (filaDeMusicas.length === 0) {

					setTimeout(() => {
						msg.member.voice.channel.leave();
						estouPronto = false;
					}, 900 * 1000);

				}
			}


			else {
				msg.channel.send('A minha fila já está limpa, não tem nada pra finalizar, você me deixou confusa kkk');
			}

		}
		else {
			msg.channel.send('Para que eu possa encerrar e limpar a fila você precisa estar na call comigo ');
		}
	}

	// skip

	else if (commandName == 'pular' || commandName == 'skip') {
		if (msg.member.voice.channel) {
			if (connection.dispatcher) {
				if (filaDeMusicas.length > 1) {
					connection.dispatcher.end();
				}
				else {
					msg.channel.send('Não tem nada na fila para eu pular, você me deixou confusa kkkk ');
				}

			}
			else {
				msg.channel.send('Não estou tocando nada');
			}

		}
		else {
			msg.channel.send('Você precisa estar em call comigo pra que eu possa pular a música');
		}
		if (connection.dispatcher) {
			if (connection.dispatcher.paused) {

				connection.dispatcher.resume();
			}
		}
	}

	// /////////////mostrar a fila
	if (commandName == 'fila' && filaDeMusicas.length >= 1 || commandName == 'queue' && filaDeMusicas.length >= 1) {

		msg.channel.send(filaDeMusicas);

	}
	if (commandName == 'fila' && filaDeMusicas.length === 0 || commandName == 'queue' && filaDeMusicas.length === 0) {
		msg.channel.send('Acabei de verificar e não há nenhuma música na fila');

	}


	// /////////////////////////////////////////
},
);


// /////////////////////////////////////////

function tocarMusica(msg) {

	connection.play(Ytdl(filaDeMusicas[0])).on('finish', () => {
		filaDeMusicas.shift();
		if (filaDeMusicas.length >= 1) {
			tocarMusica(msg);
		}
		else if (filaDeMusicas.length === 0) {

			setTimeout(() => {

				if(filaDeMusicas.length === 0) {
					msg.channel.send('Já que ninguém está precisando de nada no momento eu vou dar uma saídinha, mas se precisar de qualquer coisa me chame e eu venho na hora ^^');
					msg.member.voice.channel.leave();
					estouPronto = false;
				}
			}, 600 * 1000);


		}
	});
}

client.login(process.env.BOT_TOKEN);