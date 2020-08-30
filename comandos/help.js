module.exports = {
	name: 'help',
	description: 'Você pode ver quais são os meus comandos e quais são suas funções',
	aliases: ['ajuda', 'help'],
	usage: '[comandos]',
	cooldown: 0,
	execute(message, args, prefix) {
		const data = [];
		const { commands } = message.client;

		if (!args.length) {
			data.push('Aqui estão todos os meus comandos:\n \n%tocar ou %play (+ nome da música) [Eu pesquiso sua música no youtube e te dou as opções];\n \n%sair ou %leave (Eu limpo a fila e saio da call)\n \n%tocar ou %play (+ o link da música no youtube) [Eu toco diretamente pelo link];\n \n%pausar ou %pause [Eu paro sua música até que você peça para continuar];\n \n%continuar ou %resume ou %start [Eu continuo tocando a música que você pausou];\n \n%encerrar ou %stop [Eu paro de tocar as músicas, limpo a fila e saio da call];\n \n%pular ou %skip [Eu pulo para a próxima música na fila]\n \n%roll ou %r [Para entender melhor o roll use %help roll]\n \nAinda estou em desenvolvimento, qualquer bug ou sugestão chame o Sora#0125.');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`\nVocê pode usar ${prefix}help [comandos]\` para conseguir informações especificas sobre um comando, com exceção dos comandos de música`);

			return message.author.send(data, { split: true })
				.then(() => {
					if (message.channel.type === 'dm') return;
					message.reply('Acabei de te enviar uma mensagem no privado com todos os meus comandos ^^ ');
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('Você desativou suas mensagens privadas... asssim não posso te enviar meus comandos por lá');
					message.channel.send('Já que você não gosta que te chamem no privado, vai aqui mesmo kkk:\n %tocar ou %play (+ nome da música) [Eu pesquiso sua música no youtube e te dou as opções];\n \n%sair ou %leave (Eu limpo a fila e saio da call)\n \n%tocar ou %play (+ o link da música no youtube) [Eu toco diretamente pelo link];\n \n%pausar ou %pause [Eu paro sua música até que você peça para continuar];\n \n%continuar ou %resume ou %start [Eu continuo tocando a música que você pausou];\n \n%encerrar ou %stop [Eu paro de tocar as músicas, limpo a fila e saio da call];\n \n%pular ou %skip [Eu pulo para a próxima música na fila]\n \n%roll ou %r [Para entender melhor o roll use %help roll]\n \nAinda estou em desenvolvimento, qualquer bug ou sugestão chame o Sora#0125.');
				});
		}
		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('Esse comando não é valido, tente usar %help para ver a lista');
		}

		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Sinônimos do comando:** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Descrição:** ${command.description}`);
		if (command.usage) data.push(`**Uso:** ${prefix}${command.name} ${command.usage}`);

		data.push(`**Tempo de espera:** ${command.cooldown || 0} segundo(s)`);

		message.channel.send(data, { split: true });
	},
};