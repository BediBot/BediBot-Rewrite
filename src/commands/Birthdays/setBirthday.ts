import {Args, PieceContext} from '@sapphire/framework';
import {Message, MessageActionRow, MessageButton} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {updateBirthday} from '../../database/models/BirthdayModel';

const {Command} = require('@sapphire/framework');

const YEAR_TO_SAVE = 2025;

module.exports = class SetBirthdayCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'setbirthday',
      description: 'Sets the users birthday.',
      //TODO: Add disclaimer that anyone in a BediBot server can find your birthday (month and day) - put in detailed description
      // Note that the year will only be used to validate the date and is never saved
    });
  }

  async run(message: Message, args: Args) {
    const {guild, guildId, author} = message;
    const settingsData = await getSettings(guildId as string);

    let month;
    month = await args.pickResult('integer');
    if (!month.success) month = await args.pickResult('string');
    const day = await args.pickResult('integer');
    const year = await args.pickResult('integer');

    if (guild) await message.delete();

    if (!month.success || !day.success || !year.success) return invalidSyntaxReply(message, settingsData);

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

    const birthday = new Date(year.value, (month as number) - 1, day.value);

    // Sometimes an invalid date can be created but the date will change e.g Feb 29, 2021 becomes Mar 1, 2021. This doesn't let those cases through
    if (!(birthday.getFullYear() === year.value) || !(birthday.getMonth() + 1 === month) || !(birthday.getDate() == day.value)) {
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
const invalidSyntaxReply = async (message: Message, settingsData: { prefix: string; }) => {
  const embed = new BediEmbed()
      .setColor(colors.ERROR)
      .setTitle('Set Birthday Reply')
      .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${surroundStringWithBackTick(
          settingsData.prefix + 'setbirthday <month> <day> <year>')}`,
      );
  return message.channel.send({embeds: [embed]});
};