import {Listener} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';

import {BediEmbed} from '../lib/BediEmbed';
import {fetchPrefix} from '../utils/discordUtil';

module.exports = class MentionPrefixOnlyListener extends Listener<'mentionPrefixOnly'> {
  public async run(message: Message) {
	if (message.guild) {
	  const prefix = await fetchPrefix(message);
	  const embed = new BediEmbed().setTitle(`Type ${Formatters.inlineCode(prefix + 'help')} to see a list of commands!`);

	  return message.reply({embeds: [embed]});
	} else {
	  const embed = new BediEmbed()
						.setTitle(`Type ${Formatters.inlineCode('help')} to see a list of commands!`)
						.setDescription('Note - prefixes are not required in DMs');
	  return message.reply({embeds: [embed]});
	}
  }
};