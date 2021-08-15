import {Events, Listener, PieceContext} from '@sapphire/framework';
import {getSettings} from '../database/models/SettingsModel';
import colors from '../utils/colorUtil';
import {BediEmbed} from '../lib/BediEmbed';
import {MessageReaction, User} from 'discord.js';
import logger from '../utils/loggerUtil';

module.exports = class PinReactionListener extends Listener {
  constructor(context: PieceContext) {
    super(context, {
      event: Events.MessageReactionAdd,
    });
  }

  public async run(messageReaction: MessageReaction, user: User) {
    const {message} = messageReaction;
    const {guild, guildId} = message;

    if (!guild || messageReaction.emoji.name != '📌') return;

    if (!(await getSettings(guildId as string)).pinsEnabled) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Pin Reply')
          .setDescription('Sorry, `' + guild.name + '` does not have reaction pinning enabled');
      return user.send({embeds: [embed]});
    }

    try {
      return messageReaction.message.pin();
    } catch (error) {
      logger.error('Failed to Pin Emoji: ' + error);

      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Pin Reply')
          .setDescription('Sorry, something went wrong. Please contact a BediBot Dev.');
      return user.send({embeds: [embed]});
    }
  }
};