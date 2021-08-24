import {Events, Listener, PieceContext} from '@sapphire/framework';
import {BediEmbed} from '../lib/BediEmbed';
import colors from '../utils/colorUtil';
import {Message} from 'discord.js';
import {fetchPrefix, surroundStringWithBackTick} from '../utils/discordUtil';

export class UserEvent extends Listener<'mentionPrefixOnly'> {
	public async run(message: Message) {
		const prefix = await fetchPrefix(message);
    if(message.guild)
    {
      const embed = new BediEmbed()
        .setTitle(`Type ${surroundStringWithBackTick(prefix + "help")} to see a list of commands!`);
      
        return message.reply({embeds: [embed]});
    }
    else
    {
      const embed = new BediEmbed()
      .setTitle(`Type ${surroundStringWithBackTick("help")} to see a list of commands!`)
      .setDescription("Note - prefixes are not required in DM's");
      return message.reply({embeds: [embed]});
    }
    
	}
}