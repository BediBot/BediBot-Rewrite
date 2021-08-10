import {PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import SettingsModel, {defaultSettings} from '../../database/models/SettingsModel';

const {Command} = require('@sapphire/framework');

module.exports = class SettingsCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'settings',
      aliases: ['setting'],
      description: 'Displays the current guild settings',
    });
  }

  async run(message: Message) {
    const {guild, guildId} = message;

    if (!guild) {
      const embed = new BediEmbed()
          .setColor('RED')
          .setTitle('Settings Reply')
          .setDescription('This command is only for guilds!');

      return message.reply({
        embeds: [embed],
      });
    }

    let settingsData = await SettingsModel.findOne({guildId: guildId});

    if (!settingsData) settingsData = await SettingsModel.create(defaultSettings(guildId as string));
    settingsData.save();

    const embed = new BediEmbed()
        .setColor('BLUE')
        .setTitle('Settings Reply')
        .setDescription('Here are the settings for `' + guild.name + '`')
        .addField('Prefix', '`' + settingsData.prefix + '`', false)
        .addField('Timezone', '`' + settingsData.timezone + '`', false);

    return await message.reply({
      embeds: [embed],
    });
  }
};