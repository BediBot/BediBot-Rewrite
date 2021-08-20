import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {agenda, DUE_DATE_UPDATE_JOB_NAME} from '../../utils/schedulerUtil';

const {Command} = require('@sapphire/framework');

module.exports = class DisplayDueDatesCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'displayDueDates',
      aliases: ['ddd'],
      description: 'Displays the due dates for a certain stream in the current channel',
      preconditions: ['GuildOnly', ['AdminOnly', 'BotOwnerOnly']],
    });
  }

  async run(message: Message, args: Args) {
    const {guildId, channelId} = message;
    const settingsData = await getSettings(guildId as string);

    const categoryArg = await args.pickResult('string');

    if (!categoryArg.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Display Due Dates Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format 
          ${surroundStringWithBackTick(settingsData.prefix + 'displayDueDates <category>')}`);
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
        .setTitle('Temporary Reply');

    const reply = await message.channel.send({embeds: [embed]});

    const jobs = await agenda.jobs({
      name: DUE_DATE_UPDATE_JOB_NAME,
      'data.guildId': guildId,
      'data.category': categoryArg.value,
    });

    if (jobs.length != 0) {
      await jobs[0].remove();
    }

    await agenda.every('10 seconds', DUE_DATE_UPDATE_JOB_NAME, {
      guildId: guildId,
      channelId: channelId,
      messageId: reply.id,
      category: categoryArg.value,
    });
  }
};
