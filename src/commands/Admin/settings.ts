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

    let settingsData = await SettingsModel.findOne({_id: guildId});

    if (!settingsData) settingsData = await SettingsModel.create(defaultSettings(guildId as string));
    settingsData.save();

    const embed = new BediEmbed()
        .setColor('BLUE')
        .setTitle('Settings Reply')
        .setDescription('Here are the settings for `' + guild.name + '`. \n\nRun `' + settingsData.prefix + 'settings <module>' + '` to see ' +
            'more detailed settings. \nModules: `Verification`, `Birthdays`, `Announcements`, `Due Dates`, `Quotes`')
        .addField('Prefix', '`' + settingsData.prefix + '`', false)
        .addField('Timezone', '`' + settingsData.timezone + '`', false)
        .addField('Quotes Enabled', '`' + settingsData.quotesEnabled + '`', false)
        .addField('Pins Enabled', '`' + settingsData.pinsEnabled + '`', false)
        .addField('Verification Enabled', '`' + settingsData.verificationEnabled + '`', false)
        .addField('Birthday Announcements Enabled', '`' + settingsData.birthdayAnnouncementsEnabled + '`', false)
        .addField('Morning Announcements Enabled', '`' + settingsData.morningAnnouncementsEnabled + '`', false)
        .addField('Due Dates Enabled', '`' + settingsData.dueDatesEnabled + '`', false);

    // TODO: When settings in the various categories are implemented, settings embeds to display those settings will be added here.

    return message.reply({
      embeds: [embed],
    });
  }
};