import {Args, PieceContext} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {agenda, DUE_DATE_UPDATE_JOB_NAME} from '../../utils/schedulerUtil';

const {Command} = require('@sapphire/framework');

module.exports = class DisplayDueDatesCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'displayDueDates',
      aliases: ['ddd'],
      description: 'Displays the due dates for a certain stream in the current channel',
      preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
      detailedDescription: 'displayDueDates <stream>`' +
          '\nIf you make a mistake, just run the command again. Only the latest command for a stream will be considered.' +
          '\nYou are free to delete the messages created by this command if you wish, due dates will (obviously) stop being updated on that message.',
    });
  }

  async run(message: Message, args: Args) {
    const {guildId, channelId} = message;
    const settingsData = await getSettings(guildId as string);

    const categoryArg = await args.restResult('string');

    if (!categoryArg.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Display Due Dates Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${Formatters.inlineCode(
              settingsData.prefix + 'displayDueDates <category>')}`);
      return message.reply({embeds: [embed]});
    }

    if (!settingsData.categories.includes(categoryArg.value)) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Display Due Dates Reply')
          .setDescription('That category is not set up on this server!');
      return message.reply({embeds: [embed]});
    }

    const embed = new BediEmbed()
        .setTitle('Temporary Reply')
        .setDescription(Formatters.inlineCode('Loading . . .'));

    const reply = await message.channel.send({embeds: [embed]});

    const jobs = await agenda.jobs({
      name: DUE_DATE_UPDATE_JOB_NAME,
      'data.guildId': guildId,
      'data.category': categoryArg.value,
    });

    if (jobs.length != 0) {
      await jobs[0].remove();
    }

    const job = agenda.create(DUE_DATE_UPDATE_JOB_NAME, {
      guildId: guildId,
      channelId: channelId,
      messageId: reply.id,
      category: categoryArg.value,
    });

    await job.repeatEvery('10 seconds').save();
  }
};
