import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {getSettings} from '../../database/models/SettingsModel';
import {removeQuote} from '../../database/models/QuoteModel';

const {Command} = require('@sapphire/framework');

module.exports = class RemoveQuoteCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'removeQuote',
      aliases: ['rq'],
      description: 'Removes a quote from an individual of your choice',
      preconditions: ['GuildOnly', 'QuotesEnabled', ['AdminOnly', 'BotOwnerOnly']],
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
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${surroundStringWithBackTick(
              settingsData.prefix + 'removequote <quote> <author>')}`);
      return message.reply({embeds: [embed]});
    }

    const response = await removeQuote(guildId as string, quote.value, quoteAuthor.value.toString());

    if (!response) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Remove Quote Reply')
          .setDescription('Quote not found!');
      return message.reply({embeds: [embed]});
    }

    const dateString = response.date.toDateString();

    const embed = new BediEmbed()
        .setTitle('Remove Quote Reply');

    if (typeof quoteAuthor.value === 'string') {
      embed.setDescription(`Quote: ${surroundStringWithBackTick(quote.value)}
        Author: ${surroundStringWithBackTick(quoteAuthor.value as string)}
        Date: ${surroundStringWithBackTick(dateString)}
        Removed By: ${author}`);
    } else {
      embed.setDescription(`Quote: ${surroundStringWithBackTick(quote.value)}
        Author: ${quoteAuthor.value}
        Date: ${surroundStringWithBackTick(dateString)}
        Removed By: ${author}`);
    }

    return message.reply({embeds: [embed]});
  };
};