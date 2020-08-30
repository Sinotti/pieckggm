// eslint-disable no-unused-vars 
module.exports = {
	// eslint-disable-next-line no-inline-comments
	name: 'ping', // Deixar o nome igual o arquivo.js
	cooldown: 10,
	description: 'Ping!',
	aliases: ['pong', 'poing'],
	execute(message, args) {
		message.channel.send('Pong.');
	},
};