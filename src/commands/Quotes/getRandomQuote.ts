import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {getRandomQuote, getRandomQuoteFromAuthor} from '../../database/models/QuoteModel';

const {Command} = require('@sapphire/framework');

module.exports = class GetRandomQuoteCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'getRandomQuote',
      aliases: ['grq'],
      description: 'Gets a random quote',
      preconditions: ['GuildOnly', 'QuotesEnabled'],
      detailedDescription: `${surroundStringWithBackTick(`getRandomQuote <author:optional>`)}`,
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;

    let quoteAuthor;

    quoteAuthor = await args.pickResult('user');
    if (!quoteAuthor.success) quoteAuthor = await args.pickResult('string');

    let quoteDoc;

    if (!quoteAuthor.success) {
      quoteDoc = await getRandomQuote(guildId as string);
    } else {
      quoteDoc = await getRandomQuoteFromAuthor(guildId as string, quoteAuthor.value.toString());
    }

    if (!quoteDoc) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Get Random Quote Reply')
          .setDescription('No quotes found!');
      return message.reply({embeds: [embed]});
    }
    const embed = new BediEmbed()
        .setTitle('Get Random Quote Reply');

    let quoteText = quoteDoc.quote;

    // If a quote contains a '<' then it probably contains a mention, so don't surround it with back ticks
    if (!quoteText.includes('<')) quoteText = surroundStringWithBackTick(quoteText);

    if (quoteDoc.date) {
      if (typeof quoteAuthor.value === 'string') {
        embed.setDescription(`Quote: ${quoteText}
        Author: ${surroundStringWithBackTick(quoteDoc.name)}
        Date: ${surroundStringWithBackTick(quoteDoc.date.toDateString())}`);
      } else {
        embed.setDescription(`Quote: ${quoteText}
        Author: ${quoteDoc.name}
        Date: ${surroundStringWithBackTick(quoteDoc.date.toDateString())}`);
      }
    } else {
      if (typeof quoteAuthor.value === 'string') {
        embed.setDescription(`Quote: ${quoteText}
        Author: ${surroundStringWithBackTick(quoteDoc.name)}`);
      } else {
        embed.setDescription(`Quote: ${quoteText}
        Author: ${quoteDoc.name}`);
      }
    }

    return message.reply({embeds: [embed]});
  };
};