import {Events, Listener, PieceContext} from '@sapphire/framework';
import {MessageReaction, Permissions, User} from 'discord.js';

import {getSettings} from '../database/models/SettingsModel';
import {BediEmbed} from '../lib/BediEmbed';
import colors from '../utils/colorUtil';

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

	if (!guild.me?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
	  const embed = new BediEmbed()
						.setTitle('Pin Reply')
						.setColor(colors.ERROR)
						.setDescription('BediBot does not have the required permissions: `MANAGE MESSAGES`');
	  return message.reply({embeds: [embed]});
	}

	await messageReaction.message.unpin();

	const embed = new BediEmbed()
					  .setColor(colors.PRIMARY)
					  .setTitle('Unpin Reply')
					  .setDescription('Message unpinned successfully on `' + guild.name + '`');
	return user.send({embeds: [embed]});
  }
};