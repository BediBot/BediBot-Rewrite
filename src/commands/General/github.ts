import {PieceContext} from '@sapphire/framework';
import {Message, MessageActionRow, MessageButton} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';

const {Command} = require('@sapphire/framework');

module.exports = class GithubCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'github',
      aliases: ['git'],
      description: 'Shows the GitHub Repository for BediBot',
      detailedDescription: `${'github`'}`,
    });
  }

  async run(message: Message) {
    const embed = new BediEmbed()
        .setTitle('GitHub Reply')
        .setDescription(
            `BediBot is an open source project managed by Tron 2025s. If you would like to contribute (or star!), head over to our repository.`);

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel('GitHub')
                .setStyle('LINK')
                .setURL('https://github.com/BediBot/BediBot-Rewrite'),
        );

    return message.reply({
      embeds: [embed],
      components: [row],
    });
  };
};