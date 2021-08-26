import {PaginatedMessage} from '@sapphire/discord.js-utilities';
import {Args, PieceContext} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';

import {getQuotesFromAuthor} from '../../database/models/QuoteModel';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';

import {QUOTE_MAX_LENGTH} from './addQuote';

const {Command} = require('@sapphire/framework');

const MAX_QUOTES_PER_PAGE = 5;

module.exports = class GetQuotesCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'getQuotes',
      aliases: ['gq', 'getq', 'getquote', 'gquote', 'gquotes'],
      description: `Displays an author's quotes`,
      preconditions: ['GuildOnly', 'QuotesEnabled'],
      detailedDescription: 'getQuotes <author>`',
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
			.setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${
			    Formatters.inlineCode(settingsData.prefix + 'getquotes <author>')}`);
      return message.reply({embeds: [embed]});
    }

    const quotes = await getQuotesFromAuthor(guildId as string, quoteAuthor.value.toString());

    if (quotes.length === 0) {
      const embed = new BediEmbed().setColor(colors.ERROR).setTitle('Get Quotes Reply').setDescription('No quotes were found');
      return message.reply({embeds: [embed]});
    }

    const embed = new BediEmbed().setTitle('Get Quotes Reply').setColor(colors.ACTION).setDescription('Searching for Quotes');

    const response = await message.reply({embeds: [embed]});

    let templateDescription;

    if (typeof quoteAuthor.value === 'string') {
      templateDescription = `Quotes by ${Formatters.inlineCode(quoteAuthor.value)}`;
    } else {
      templateDescription = `Quotes by ${quoteAuthor.value}`;
    }

    // Creates a PaginatedMessage Object (built into Sapphire framework)
    const paginatedMessage = new PaginatedMessage();

    for (let i = 0; i < quotes.length; i += MAX_QUOTES_PER_PAGE) {
      let embed = new BediEmbed()
		      .setTitle('Get Quotes Reply')
		      .setDescription(templateDescription)
		      .setFooter('  For any concerns, contact a BediBot Dev');

      for (let j = 0; j < MAX_QUOTES_PER_PAGE; j++) {
	if ((i + j) >= quotes.length) break;

	let quoteText = quotes[i + j].quote;
	if (quoteText.length > QUOTE_MAX_LENGTH) quoteText = quoteText.slice(QUOTE_MAX_LENGTH) + '...';

	// If a quote contains a '<' then it probably contains a mention, so don't surround it with back ticks
	if (!quoteText.includes('<')) quoteText = Formatters.inlineCode(quoteText);

	if (quotes[i + j].date)
	  embed.addField(`<t:${Math.round(quotes[i + j].date.valueOf() / 1000)}:f>`, quoteText, false);
	else
	  embed.addField('Before Sep 2021', quoteText, false);
      }

      paginatedMessage.addPageEmbed(embed);
    }

    return paginatedMessage.run(response, message.author);
  };
};