import {Args, PieceContext} from '@sapphire/framework';
import {Message, MessageActionRow, MessageButton} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {fetchPrefix, surroundStringWithBackTick} from '../../utils/discordUtil';
import {updateBirthday} from '../../database/models/BirthdayModel';
import {didDateChange, isValidMonth} from '../../utils/dateUtil';

const {Command} = require('@sapphire/framework');

const YEAR_TO_SAVE = 2025;

module.exports = class SetBirthdayCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'setbirthday',
      aliases: ['sb'],
      description: 'Sets the users birthday.',
      detailedDescription: `${'setBirthday <month> <day> <year>`'}
The month can be long (January), short (Jan), or number (1).
If you choose to set your birthday, anyone in a BediBot server will be able to find your birthday (month and day).
We will never save your birth year, it is only used to validate your entry and ensure it is a real date.`,
    });
  }

  async run(message: Message, args: Args) {
    const {guild, guildId, author} = message;
    const prefix = (await fetchPrefix(message))[0];

    let month;
    month = await args.pickResult('integer');
    if (!month.success) month = await args.pickResult('string');
    const day = await args.pickResult('integer');
    const year = await args.pickResult('integer');

    if (guild) await message.delete();

    if (!month.success || !day.success || !year.success) return invalidSyntaxReply(message, prefix);

    // If month is a string, parse it into a date and extract the month number. This works with full month and short forms as well.
    month = isValidMonth(month.value);

    if (!month) return invalidSyntaxReply(message, prefix);

    let birthday = new Date(year.value, (month as number) - 1, day.value);

    // Sometimes an invalid date can be created but the date will change e.g Feb 29, 2021 becomes Mar 1, 2021. This doesn't let those cases through
    if (didDateChange(birthday, day.value, month as number, year.value)) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Set Birthday Reply')
          .setDescription('That date is invalid!');
      return message.channel.send({embeds: [embed]});
    }

    // Change year to a random year as we do not need the users year for our purposes
    birthday.setFullYear(YEAR_TO_SAVE);

    const row = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('birthdayAgree')
            .setLabel('Yes')
            .setStyle('SUCCESS'),
        new MessageButton()
            .setCustomId('birthdayDisagree')
            .setLabel('No')
            .setStyle('DANGER'),
    );

    const birthdayString = surroundStringWithBackTick(`${birthday.toLocaleString('default', {month: 'long'})} ${birthday.getDate()}`);

    const embed = new BediEmbed()
        .setTitle('Set Birthday Reply')
        .setDescription(`Birthday: ${birthdayString}
        \nBirthdays saved by BediBot can be seen by **anyone** that shares a server with BediBot.
        We will **never** save your birth year, only the month and day.
        Do you agree to save your birthday?`);
    const reply = await message.author.send({
      embeds: [embed],
      components: [row],
    });

    let updateEmbed = new BediEmbed()
        .setTitle('Set Birthday Reply')
        .setColor(colors.ERROR)
        .setDescription('You did not respond in time');
    const updateRow = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('birthdayAgree')
            .setLabel('Yes')
            .setStyle('SUCCESS')
            .setDisabled(true),
        new MessageButton()
            .setCustomId('birthdayDisagree')
            .setLabel('No')
            .setStyle('DANGER')
            .setDisabled(true),
    );

    // This collector will wait for a button click and act accordingly
    // Normally you would need to check that the person who clicked was the author of the original command, but this takes place in a DM
    const collector = reply.createMessageComponentCollector({componentType: 'BUTTON', time: 15000});
    collector.on('collect', async interaction => {
      await interaction.deferUpdate();
      if (interaction.customId === 'birthdayAgree') {
        updateEmbed.setDescription(`Your birthday has been saved as ${birthdayString}`)
                   .setColor(colors.PRIMARY);
        await updateBirthday(author.id, birthday);
      } else {
        updateEmbed.setDescription('Your birthday has **NOT** been saved');
      }
      collector.stop();
    });

    collector.on('end', async collected => {
      await reply.edit({
        embeds: [updateEmbed],
        components: [updateRow],
      });
    });
  }
};

/**
 * Replies with the invalid syntax message - This function is purely to avoid repeated code
 * @param message
 * @param settingsData
 * @returns {Promise<Message>}
 */
const invalidSyntaxReply = async (message: Message, prefix: string) => {
  const embed = new BediEmbed()
      .setColor(colors.ERROR)
      .setTitle('Set Birthday Reply')
      .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${surroundStringWithBackTick(
          prefix + 'setbirthday <month> <day> <year>')}`,
      );
  return message.channel.send({embeds: [embed]});
};