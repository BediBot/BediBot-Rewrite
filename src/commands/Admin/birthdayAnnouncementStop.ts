import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {agenda, BIRTH_ANNOUNCE_JOB_NAME} from '../../utils/schedulerUtil';

const {Command} = require('@sapphire/framework');

module.exports = class StopBirthdayAnnouncementCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'stopBirthdayAnnouncement',
      aliases: ['stopba', 'sba'],
      description: 'Stops any scheduled birthday announcements in this guild',
      preconditions: ['GuildOnly', ['AdminOnly', 'BotOwnerOnly']],
    });
  }

  async run(message: Message, args: Args) {
    const {guildId, guild} = message;

    await agenda.cancel({
      'name': BIRTH_ANNOUNCE_JOB_NAME,
      'data.guildId': guildId,
    });

    const embed = new BediEmbed()
        .setTitle('Stop Birthday Announcement Reply')
        .setDescription(`Birthday Announcements have been cancelled for ${surroundStringWithBackTick(guild?.name as string)}`);
    return message.reply({embeds: [embed]});
  }
};

