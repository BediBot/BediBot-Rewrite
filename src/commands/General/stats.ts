import {PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import {numGuilds, numUsers, surroundStringWithBackTick} from '../../utils/discordUtil';

const {Command} = require('@sapphire/framework');

module.exports = class StatsCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'stats',
      aliases: ['stat'],
      description: 'Sends some statistics about the bot',
    });
  }

  async run(message: Message) {
    const embed = new BediEmbed()
        .setTitle('Stats Reply')
        .setDescription(`Guild Count: ${surroundStringWithBackTick(String(numGuilds(this.container.client)))}
        Member Count: ${surroundStringWithBackTick(String(await numUsers(this.container.client)))}`);
    return message.reply({embeds: [embed]});
  }
};