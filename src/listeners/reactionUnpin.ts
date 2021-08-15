import {Events, Listener, PieceContext} from '@sapphire/framework';
import colors from '../utils/colorUtil';
import {BediEmbed} from '../lib/BediEmbed';
import {MessageReaction, User} from 'discord.js';
import logger from '../utils/loggerUtil';
import {getSettings} from '../database/models/SettingsModel';

module.exports = class PinReactionListener extends Listener {
  constructor(context: PieceContext) {
    super(context, {
      event: Events.MessageReactionRemove,
    });
  }

  public async run(messageReaction: MessageReaction, user: User) {
    const {message} = messageReaction;
    const {guild, guildId} = message;

    const settingsData = await getSettings(guildId as string);

    if (!guild || messageReaction.emoji.name != settingsData.pinEmoji) return;

    if (!settingsData.pinsEnabled) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Unpin Reply')
          .setDescription('Sorry, `' + guild.name + '` does not have reaction pinning enabled');
      return user.send({embeds: [embed]});
    }

    try {
      await messageReaction.message.unpin();

      const embed = new BediEmbed()
          .setColor(colors.PRIMARY)
          .setTitle('Unpin Reply')
          .setDescription('Message unpinned successfully on `' + guild.name + '`');
      return user.send({embeds: [embed]});
    } catch (error) {
      logger.error('Failed to Unpin Emoji: ' + error);

      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Pin Reply')
          .setDescription('Sorry, something went wrong. Please contact a BediBot Dev.');
      return user.send({embeds: [embed]});
    }
  }
};