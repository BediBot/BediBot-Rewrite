import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import settingsModel, {getSettings} from '../../database/models/SettingsModel';

const {Command} = require('@sapphire/framework');

module.exports = class SetVerifiedRoleCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'setVerifiedRole',
      aliases: ['svr'],
      description: 'Changes the verified role for BediBot',
      preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
      detailedDescription: `${'setVerifiedRole <newRole>`'}`,
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;
    const settingsData = await getSettings(guildId as string);

    // Check if they even inputted a string
    const newValue = await args.peekResult('role');
    if (!newValue.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Set Verified Role Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format 
          ${surroundStringWithBackTick(settingsData.prefix + 'setVerifiedRole <newRole>')}`);
      return message.reply({embeds: [embed]});
    }

    await settingsModel.updateOne({_id: guildId as string}, {verifiedRole: newValue.value.name});

    const embed = new BediEmbed()
        .setTitle('Set Verified Role Reply')
        .setDescription(`The verified role has been updated to ${surroundStringWithBackTick(newValue.value.name)}`);
    return message.reply({embeds: [embed]});
  };
};