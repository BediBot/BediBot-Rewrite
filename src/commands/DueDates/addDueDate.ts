import {Args, PieceContext} from '@sapphire/framework';
import {Message, MessageActionRow, MessageButton, MessageSelectMenu} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {agenda, DUE_DATE_UPDATE_JOB_NAME, isValidTime} from '../../utils/schedulerUtil';
import moment from 'moment-timezone/moment-timezone-utils';
import {addDueDate} from '../../database/models/DueDateModel';
import {didDateChange, isValidMonth} from '../../utils/dateUtil';

const {Command} = require('@sapphire/framework');

module.exports = class AddQuoteCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'addDueDate',
      aliases: ['add', 'adddue', 'adddate'],
      description: 'Adds a due date',
      preconditions: ['GuildOnly', 'DueDatesEnabled'],
      detailedDescription: `${surroundStringWithBackTick(`addDueDate <title> <month> <day> <year> <time:optional>`)}
The month can be long (January), short (Jan), or number (1).
You can specify the (optional) time in most common time formats.
Make sure to run the displayDueDates command somewhere!`,
    });
  }

  async run(message: Message, args: Args) {
    const {guild, guildId, author} = message;
    const settingsData = await getSettings(guildId as string);

    const title = await args.pickResult('string');
    let month;
    month = await args.pickResult('integer');
    if (!month.success) month = await args.pickResult('string');
    const day = await args.pickResult('integer');
    const year = await args.pickResult('integer');
    const timeString = await args.restResult('string');

    if (!title.success || !month.success || !day.success || !year.success) return invalidSyntaxReply(message, settingsData);

    // If month is a string, parse it into a date and extract the month number. This works with full month and short forms as well.
    month = isValidMonth(month.value);

    if (!month) return invalidSyntaxReply(message, settingsData);

    let date = new Date(year.value, month - 1, day.value);

    // Sometimes an invalid date can be created but the date will change e.g Feb 29, 2021 becomes Mar 1, 2021. This doesn't let those cases through
    if (didDateChange(date, day.value, month, year.value)) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Add Due Date Reply')
          .setDescription('That date is invalid!');
      return message.channel.send({embeds: [embed]});
    }

    const dateMoment = moment.tz(moment(date).format('YYYY-MM-DD'), settingsData.timezone);

    let dateOnly = true;

    if (timeString.success) {
      if (!isValidTime(timeString.value)) {
        const embed = new BediEmbed()
            .setColor(colors.ERROR)
            .setTitle('Add Due Date Reply')
            .setDescription('That is not a valid time.');
        return message.reply({embeds: [embed]});
      }

      const job = await agenda.schedule(timeString.value, 'Dummy Job', {});
      const tempDate = job.attrs.nextRunAt;
      await job.remove();

      dateMoment.set({h: tempDate?.getHours(), m: tempDate?.getMinutes()});
      dateOnly = false;
    }

    if (dateMoment < moment().subtract(1, 'd') || (!dateOnly && dateMoment < moment())) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Add Due Date Reply')
          .setDescription('You can not set a date/time in the past.');
      return message.reply({embeds: [embed]});
    }

    date = dateMoment.toDate();

    if (settingsData.types.length === 0) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Add Due Date Reply')
          .setDescription('Your server has no due date types setup. Ask an admin to add some.'); //TODO: 'Add some with $command' when implemented
      return message.reply({embeds: [embed]});
    }

    if (settingsData.categories.length === 0) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Add Due Date Reply')
          .setDescription('Your server has no categories setup. Ask an admin to add some.'); //TODO: 'Add some with $command' when implemented
      return message.reply({embeds: [embed]});
    }

    if (settingsData.courses.length === 0) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Add Due Date Reply')
          .setDescription('Your server has no courses setup. Ask an admin to add some.'); //TODO: 'Add some with $command' when implemented
      return message.reply({embeds: [embed]});
    }

    const typeSelectMenu = new MessageSelectMenu().setCustomId('typeSelect').setPlaceholder('Select a Type');
    for (const type of settingsData.types) {
      typeSelectMenu.addOptions([
        {
          label: type,
          value: type,
        }]);
    }
    const typeSelect = new MessageActionRow().addComponents(typeSelectMenu);

    const categorySelectMenu = new MessageSelectMenu().setCustomId('categorySelect').setPlaceholder('Select a Category');
    for (const category of settingsData.categories) {
      categorySelectMenu.addOptions([
        {
          label: category,
          value: category,
        }]);
    }
    const categorySelect = new MessageActionRow().addComponents(categorySelectMenu);

    const courseSelectMenu = new MessageSelectMenu().setCustomId('courseSelect').setPlaceholder('Select a Course');
    for (const course of settingsData.courses) {
      courseSelectMenu.addOptions([
        {
          label: course,
          value: course,
        }]);
    }
    const courseSelect = new MessageActionRow().addComponents(courseSelectMenu);

    const buttons = new MessageActionRow()
        .addComponents([
          new MessageButton()
              .setCustomId('dueDateSubmit')
              .setLabel('Submit')
              .setStyle('SUCCESS'),
          new MessageButton()
              .setCustomId('dueDateCancel')
              .setLabel('Cancel')
              .setStyle('DANGER'),
        ]);

    const embed = new BediEmbed()
        .setTitle('Add Due Date Reply');

    if (dateOnly) embed.setDescription(`${surroundStringWithBackTick(title.value)} to be due ${surroundStringWithBackTick(
        `${date.toLocaleString('en-US', {timeZone: settingsData.timezone, dateStyle: 'full'})}`)}`);
    else embed.setDescription(`${surroundStringWithBackTick(title.value)} to be due ${surroundStringWithBackTick(
        `${date.toLocaleString('en-US', {timeZone: settingsData.timezone, dateStyle: 'full', timeStyle: 'short'})}`)}`);
    const reply = await message.reply({
      embeds: [embed],
      components: [typeSelect, categorySelect, courseSelect, buttons],
    });

    let type: string | null = null;
    let category: string | null = null;
    let course: string | null = null;

    const selectCollector = reply.createMessageComponentCollector({componentType: 'SELECT_MENU', time: 60000});
    selectCollector.on('collect', async interaction => {
      if (!interaction.isSelectMenu()) return;
      if (interaction.user.id != message.author.id) {
        const embed = new BediEmbed()
            .setTitle('Add Due Date Reply')
            .setColor(colors.ERROR)
            .setDescription('You did not run this command');

        return interaction.reply({
          ephemeral: true,
          embeds: [embed],
        });
      }
      await interaction.deferUpdate();

      if (interaction.customId === 'typeSelect') type = interaction.values[0];
      else if (interaction.customId === 'categorySelect') category = interaction.values[0];
      else course = interaction.values[0];
    });

    selectCollector.on('end', async collected => {
      await reply.edit({
        embeds: [embed],
        components: [],
      });
    });

    const buttonCollector = reply.createMessageComponentCollector({componentType: 'BUTTON', time: 60000});
    buttonCollector.on('collect', async interaction => {
      if (!interaction.isButton()) return;
      if (interaction.user.id != message.author.id) {
        const embed = new BediEmbed()
            .setTitle('Add Due Date Reply')
            .setColor(colors.ERROR)
            .setDescription('You did not run this command');

        return interaction.reply({
          ephemeral: true,
          embeds: [embed],
        });
      }

      if (interaction.customId === 'dueDateCancel') {
        await reply.edit({
          embeds: [embed.setDescription('Due date cancelled.')],
          components: [],
        });
        return interaction.deferUpdate();
      }

      if (!type || !category || !course) {
        const embed = new BediEmbed()
            .setTitle('Toggle Modules Reply')
            .setDescription('Please select all a due date, category, and course first');

        return interaction.reply({
          ephemeral: true,
          embeds: [embed],
        });
      }

      await addDueDate(guildId as string, title.value, date, type, category, course, dateOnly);

      const jobs = await agenda.jobs({
        name: DUE_DATE_UPDATE_JOB_NAME,
        'data.guildId': guildId,
        'data.category': category,
      });

      if (jobs.length != 0) {
        await jobs[0].run();
      }

      await reply.edit({
        embeds: [embed],
        components: [],
      });

      return interaction.deferUpdate();
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
      .setTitle('Add Due Date Reply')
      .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${surroundStringWithBackTick(
          settingsData.prefix + 'addDueDate <title> <month> <day> <year> <time:optional>')}`,
      );
  return message.channel.send({embeds: [embed]});
};