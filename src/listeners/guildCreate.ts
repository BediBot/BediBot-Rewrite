import {Events, Listener, PieceContext} from '@sapphire/framework';
import {BediEmbed} from '../lib/BediEmbed';
import colors from '../utils/colorUtil';
import {Guild} from 'discord.js';
import {surroundStringWithBackTick} from '../utils/discordUtil';
import settingsModel, {getSettings} from '../database/models/SettingsModel';

module.exports = class GuildCreateListener extends Listener {
  constructor(context: PieceContext) {
    super(context, {
      event: Events.GuildCreate,
    });
  }

  public async run(guild: Guild) {
    let channel = guild.systemChannel;

    await settingsModel.deleteOne({_id: guild.id}); //This will delete existing settings data
    const settingsData = await getSettings(guild.id as string);

    const embed = new BediEmbed()
        .setTitle('BediBot has entered the server!')
        .setColor(colors.PRIMARY)
        .addField('List of commands', `Run ${surroundStringWithBackTick(settingsData.prefix + 'help')} to see the list of commands`)
        .addField('How to view settings',
            `Run ${surroundStringWithBackTick(settingsData.prefix + 'settings')} to see the various settings that can be changed.`)
        .addField('Due Dates', `To set up due dates, first set up due date types, categories, and courses (see ${surroundStringWithBackTick(
            settingsData.prefix + 'help')} for commands).
Then, run ${surroundStringWithBackTick(settingsData.prefix + 'displayDueDates <category>')} to display them in a channel.`)
        .addField('Verification', `To set up verification, first set up the email domain and verified role (see ${surroundStringWithBackTick(
                settingsData.prefix + 'help')} for commands).\n` +
            `Then, run ${surroundStringWithBackTick(settingsData.prefix + 'toggleModules')} to enable verification.`)
        .addField('Morning Announcements', `Morning announcements will send a morning message with a random quote from your guild at a set time.\n` +
            `Run ${surroundStringWithBackTick(settingsData.prefix + 'morningAnnouncement <time>')} in a channel to set them up.`)
        .addField('Birthday Announcements',
            `Birthday announcements will send a birthday message containing all the users who have birthdays that day at a set time. ` +
            `It can also give those users a special role for a day if you choose.\n` +
            `Run ${surroundStringWithBackTick(settingsData.prefix + 'birthdayAnnouncement <time> <role:optional>')} in a channel to set them up.`);
    return channel?.send({embeds: [embed]});
  }
};