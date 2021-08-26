import {PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';

const {Command} = require('@sapphire/framework');

module.exports = class PingCommand extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'ping',
            description: 'Send back the ping of the bot',
            detailedDescription: 'ping`',
        });
    }

    async run(message: Message) {
        const initialEmbed = new BediEmbed().setTitle('Ping?');

        const msg = await message.reply({
            embeds: [initialEmbed],
        });

        const editEmbed = new BediEmbed().setTitle('Pong!').setDescription(`Bot Latency ${
            Math.round(this.container.client.ws.ping)}ms. API Latency ${msg.createdTimestamp - message.createdTimestamp}ms.`);
        return msg.edit({embeds: [editEmbed]});
    }
};