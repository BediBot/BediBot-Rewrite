import {PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';

import {getSettings} from '../../database/models/SettingsModel';
import {removeVerifiedUser, userVerifiedInGuild} from '../../database/models/VerifiedUserModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';

const {Command} = require('@sapphire/framework');

module.exports = class UnverifyCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'unverify',
      description: 'Unverifies you from the server.',
      preconditions: ['GuildOnly', 'VerificationEnabled'],
      detailedDescription: `${'unverify`'}`,
    });
  }

  async run(message: Message) {
    const {guild, guildId, author} = message;
    const settingsData = await getSettings(guildId as string);

    if (!(await userVerifiedInGuild(author.id, guildId as string))) {
      const embed = new BediEmbed()
			.setColor(colors.ERROR)
			.setTitle('Unverify Reply')
			.setDescription(`You are not verified on this server! Run ${settingsData.prefix}verify if necessary.`);
      return message.reply({embeds: [embed]});
    }

    const serverReplyEmbed = new BediEmbed()
				 .setTitle('Unverify Reply')
				 .setColor(colors.SUCCESS)
				 .setDescription('A confirmation has been sent to you via DM.');
    await message.reply({embeds: [serverReplyEmbed]});

    await removeVerifiedUser(author.id, guildId as string);
    const embed = new BediEmbed()
		      .setTitle('Unverify Reply')
		      .setColor(colors.SUCCESS)
		      .setDescription('You have been unverified on `' + guild!.name + '`');
    return message.author.send({embeds: [embed]});
  }
};