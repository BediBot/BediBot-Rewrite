import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {PaginatedMessage} from '@sapphire/discord.js-utilities';
import {getQuotesFromAuthor} from '../../database/models/QuoteModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {getSettings} from '../../database/models/SettingsModel';

const {Command} = require('@sapphire/framework');

const MAX_QUOTES_PER_PAGE = 5;

module.exports = class RemoveQuoteCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'getQuotes',
      aliases: ['gq'],
      description: 'Displays an authors quotes',
      preconditions: ['GuildOnly', 'QuotesEnabled'],
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;
    const settingsData = await getSettings(guildId as string);

    let quoteAuthor;

    quoteAuthor = await args.pickResult('user');
    if (!quoteAuthor.success) quoteAuthor = await args.pickResult('string');

    if (!quoteAuthor.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Get Quotes Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${surroundStringWithBackTick(
              settingsData.prefix + 'getquotes <author>')}`);
      return message.reply({embeds: [embed]});
    }

    const quotes = await getQuotesFromAuthor(guildId as string, quoteAuthor.value.toString());

    if (quotes.length === 0) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Get Quotes Reply')
          .setDescription('No quotes were found');
      return message.reply({embeds: [embed]});
    }

    const embed = new BediEmbed()
        .setTitle('Get Quotes Reply')
        .setDescription('Searching for Quotes');

    const response = await message.reply({embeds: [embed]});

    let templateDescription;

    if (typeof quoteAuthor.value === 'string') {
      templateDescription = `Quotes by ${surroundStringWithBackTick(quoteAuthor.value)}`;
    } else {
      templateDescription = `Quotes by ${quoteAuthor.value}`;
    }

    const paginatedMessage = new PaginatedMessage();

    for (let i = 0; i < quotes.length; i += 5) {
      let embed = new BediEmbed()
          .setTitle('Get Quotes Reply')
          .setDescription(templateDescription)
          .setFooter('  For any concerns, contact a BediBot Dev');

      for (let j = 0; j < MAX_QUOTES_PER_PAGE; j++) {
        if ((i + j) >= quotes.length) break;
        embed.addField(quotes[i + j].date.toDateString(), surroundStringWithBackTick(quotes[i + j].quote), false);
      }

      paginatedMessage.addPageEmbed(embed);
    }

    return paginatedMessage.run(response, message.author);
  };
};