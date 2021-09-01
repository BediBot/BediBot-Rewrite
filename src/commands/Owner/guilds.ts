import {PieceContext} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';

const {Command} = require('@sapphire/framework');

module.exports = class StatsCommand extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'guilds',
            description: 'Sends a list of guilds the bot is in',
            preconditions: ['BotOwnerOnly'],
        });
    }

    async run(message: Message) {
        let description = '';

        for (const guild of this.container.client.guilds.cache) {
            description += `${Formatters.inlineCode(guild[1].name)} - ${Formatters.inlineCode(guild[1].id)}\n`;
        }

        const embed = new BediEmbed().setTitle('Guilds Reply').setDescription(description);
        return message.author.send({embeds: [embed]});
    }
};