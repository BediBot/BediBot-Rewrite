import {Args, PieceContext} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';

import {removeQuote} from '../../database/models/QuoteModel';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';

const {Command} = require('@sapphire/framework');

module.exports = class RemoveQuoteCommand extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'removeQuote',
            aliases: ['rq'],
            description: 'Removes a quote from an individual of your choice',
            preconditions: ['GuildOnly', 'QuotesEnabled', ['BotOwnerOnly', 'AdminOnly']],
            detailedDescription: 'removeQuote <quote> <author>`',
        });
    }

    async run(message: Message, args: Args) {
        const {guildId, author} = message;
        const settingsData = await getSettings(guildId as string);

        const quote = await args.pickResult('string');

        let quoteAuthor;

        quoteAuthor = await args.pickResult('user');
        if (!quoteAuthor.success) quoteAuthor = await args.pickResult('string');

        if (!quote.success || !quoteAuthor.success) {
            const embed = new BediEmbed()
                              .setColor(colors.ERROR)
                              .setTitle('Remove Quote Reply')
                              .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${
                                  Formatters.inlineCode(settingsData.prefix + 'removeQuote <quote> <author>')}`);
            return message.reply({embeds: [embed]});
        }

        const response = await removeQuote(guildId as string, quote.value, quoteAuthor.value.toString());

        if (!response) {
            const embed =
                new BediEmbed().setColor(colors.ERROR).setTitle('Remove Quote Reply').setDescription('Quote not found!');
            return message.reply({embeds: [embed]});
        }

        const embed = new BediEmbed().setTitle('Remove Quote Reply');

        if (typeof quoteAuthor.value === 'string') {
            embed.setDescription(`Quote: ${Formatters.inlineCode(quote.value)}\nAuthor: ${
                Formatters.inlineCode(quoteAuthor.value as string)}\nDate: <t:${
                Math.round(response.date.valueOf() / 1000)}:f>\nRemoved By: ${author}`);
        } else {
            embed.setDescription(`Quote: ${Formatters.inlineCode(quote.value)}\nAuthor: ${quoteAuthor.value}\nDate: <t:${
                Math.round(response.date.valueOf() / 1000)}:f>\nRemoved By: ${author}`);
        }

        return message.reply({embeds: [embed]});
    };
};