import {PieceContext} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import {numGuilds, numUsers} from '../../utils/discordUtil';

const {Command} = require('@sapphire/framework');

module.exports = class StatsCommand extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'stats',
            aliases: ['stat'],
            description: 'Sends some statistics about the bot',
            detailedDescription: 'stats`',
        });
    }

    async run(message: Message) {
        const embed =
            new BediEmbed()
                .setTitle('Stats Reply')
                .setDescription(`Guild Count: ${Formatters.inlineCode(String(numGuilds(this.container.client)))}\nMember Count: ${
                    Formatters.inlineCode(String(await numUsers(this.container.client)))}`);
        return message.reply({embeds: [embed]});
    }
};