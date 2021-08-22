import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import settingsModel, {getSettings} from '../../database/models/SettingsModel';

const {Command} = require('@sapphire/framework');

module.exports = class SetPrefixCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'setPrefix',
      aliases: ['sp'],
      description: 'Changes the prefix for BediBot',
      preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
      detailedDescription: `${'setPrefix <newPrefix>`'}`,
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;
    const settingsData = await getSettings(guildId as string);

    // Check if they even inputted a string
    const newValue = await args.peekResult('string');
    if (!newValue.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Set Prefix Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format 
          ${surroundStringWithBackTick(settingsData.prefix + 'setPrefix <newPrefix>')}`);
      return message.reply({embeds: [embed]});
    }

    await settingsModel.updateOne({_id: guildId as string}, {prefix: newValue.value});

    const embed = new BediEmbed()
        .setTitle('Set Prefix Reply')
        .setDescription(`The prefix has been updated to ${surroundStringWithBackTick(newValue.value)}`);
    return message.reply({embeds: [embed]});
  };
};