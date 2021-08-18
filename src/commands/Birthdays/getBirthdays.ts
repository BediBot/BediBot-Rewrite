import {Args, PieceContext} from '@sapphire/framework';
import {MemberMention, Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {getSettings} from '../../database/models/SettingsModel';
import {getBirthdaysFromMonth} from '../../database/models/BirthdayModel';
import {PaginatedMessage} from '@sapphire/discord.js-utilities';

const {Command} = require('@sapphire/framework');

const MAX_BIRTHDAYS_PER_PAGE = 5;

module.exports = class GetBirthdays extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'getbirthdays',
      description: 'Gets the birthdays for a month',
      preconditions: ['GuildOnly'],
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;
    const settingsData = await getSettings(guildId as string);

    let month;
    month = await args.pickResult('integer');
    if (!month.success) month = await args.pickResult('string');

    if (!month.success) return invalidSyntaxReply(message, settingsData);

    // If month is a string, parse it into a date and extract the month number. This works with full month and short forms as well.
    if (typeof month.value === 'string') {
      const tempDate = Date.parse(month.value + '1, 2021');
      if (!isNaN(tempDate)) {
        month = new Date(tempDate).getMonth() + 1;
      } else return invalidSyntaxReply(message, settingsData);
    }

    // Set month variable to value for consistency
    if (typeof month != 'number') {
      month = month.value;
    }

    if (!(month > 0 && month <= 12)) return invalidSyntaxReply(message, settingsData);

    const birthdays = await getBirthdaysFromMonth(month as number);
    const members = await message.guild?.members.fetch();
    birthdays.filter(birthday => members?.has(birthday._id));

    if (birthdays.length === 0) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Get Birthdays Reply')
          .setDescription('No birthdays were found');
      return message.reply({embeds: [embed]});
    }

    const embed = new BediEmbed()
        .setTitle('Get Birthdays Reply')
        .setDescription('Searching for Quotes');

    const response = await message.reply({embeds: [embed]});

    const monthString = birthdays[0].birthDate.toLocaleString('default', {month: 'long'});
    const templateDescription = `Here are the birthdays for the month of ${surroundStringWithBackTick(monthString)}`;

    const paginatedMessage = new PaginatedMessage();

    for (let i = 0; i < birthdays.length; i += MAX_BIRTHDAYS_PER_PAGE) {
      let embed = new BediEmbed()
          .setTitle('Get Birthdays Reply')
          .setDescription(templateDescription)
          .setFooter('  For any concerns, contact a BediBot Dev');

      for (let j = 0; j < MAX_BIRTHDAYS_PER_PAGE; j++) {
        if ((i + j) >= birthdays.length) break;
        embed.addField(`${monthString} ${birthdays[i + j].birthDate.getDate()}`, members?.get(birthdays[i + j]._id)?.toString() as MemberMention,
            false);
      }
      paginatedMessage.addPageEmbed(embed);
    }
    return paginatedMessage.run(response, message.author);
  }
};

/**
 * Replies with the invalid syntax message - This function is purely to avoid repeated code
 * @param message
 * @param settingsData
 * @returns {Promise<Message>}
 */
const invalidSyntaxReply = async (message: Message, settingsData: { prefix: string; }) => {
  const embed = new BediEmbed()
      .setColor(colors.ERROR)
      .setTitle('Get Birthdays Reply')
      .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${surroundStringWithBackTick(
          settingsData.prefix + 'getbirthdays <month> <day> <year>')}`,
      );
  return message.channel.send({embeds: [embed]});
};