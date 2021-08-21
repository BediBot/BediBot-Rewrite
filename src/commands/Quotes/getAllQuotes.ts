import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {PaginatedMessage} from '@sapphire/discord.js-utilities';
import {getQuotesInGuild} from '../../database/models/QuoteModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {getUserFromMention, surroundStringWithBackTick} from '../../utils/discordUtil';
import {getSettings} from '../../database/models/SettingsModel';

const {Command} = require('@sapphire/framework');

const MAX_QUOTES_PER_PAGE = 5;

module.exports = class GetAllQuotesCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'getAllQuotes',
      aliases: ['gaq', 'getaq', 'getaquote', 'gaquote', 'gaquotes'],
      description: 'Displays all quotes',
      preconditions: ['GuildOnly', 'QuotesEnabled'],
      detailedDescription: `${'getAllQuotes`'}`,
    });
  }

  async run(message: Message, args: Args) {
    const {guildId, guild} = message;
    const settingsData = await getSettings(guildId as string);

    const quotes = await getQuotesInGuild(guildId as string);

    if (quotes.length === 0) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Get All Quotes Reply')
          .setDescription('No quotes were found');
      return message.reply({embeds: [embed]});
    }

    const embed = new BediEmbed()
        .setTitle('Get All Quotes Reply')
        .setDescription('Searching for Quotes');

    const response = await message.reply({embeds: [embed]});

    const templateDescription = `Quotes from ${surroundStringWithBackTick(guild?.name as string)}`;

    // Creates a PaginatedMessage Object (built into Sapphire framework)
    const paginatedMessage = new PaginatedMessage();

    for (let i = 0; i < quotes.length; i += MAX_QUOTES_PER_PAGE) {
      let embed = new BediEmbed()
          .setTitle('Get All Quotes Reply')
          .setDescription(templateDescription)
          .setFooter('  For any concerns, contact a BediBot Dev');

      for (let j = 0; j < MAX_QUOTES_PER_PAGE; j++) {
        if ((i + j) >= quotes.length) break;
        const user = await getUserFromMention(quotes[i + j].author as string);
        let title: string;
        let field: string;

        if (quotes[i + j].date) title = quotes[i + j].date.toDateString();
        else title = 'Before Sep 2021';

        if (user) field = `${surroundStringWithBackTick(quotes[i + j].quote)} by ${user.toString()}`;
        else field = `${surroundStringWithBackTick(quotes[i + j].quote)} by ${surroundStringWithBackTick(quotes[i + j].author)}`;

        embed.addField(title, field);
      }

      paginatedMessage.addPageEmbed(embed);
    }

    return paginatedMessage.run(response, message.author);
  };
};