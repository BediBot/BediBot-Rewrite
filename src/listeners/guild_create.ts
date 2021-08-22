import {Events, Listener, PieceContext} from '@sapphire/framework';
import {BediEmbed} from '../lib/BediEmbed';
import colors from '../utils/colorUtil';
import { Guild } from 'discord.js';
import { surroundStringWithBackTick } from '../utils/discordUtil';
import {getSettings } from '../database/models/SettingsModel';
import settingsModel from "../database/models/SettingsModel";

module.exports = class GuildCreateListener extends Listener {
  constructor(context: PieceContext) {
    super(context, {
      once: true,
      event: Events.GuildCreate,
    });
  }

  public async run(guild_object: Guild) {
    let channel = guild_object.systemChannel
    await settingsModel.deleteOne({_id: guild_object.id}) //This will delete existing settings data
    const settingsData = await getSettings(guild_object.id as string);
    const embed = new BediEmbed()
      .setTitle('BediBot has entered the server!')
      .setColor(colors.PRIMARY)
      .addField("List of commands", `Run ${surroundStringWithBackTick(settingsData.prefix + 'help')} to see the list of commands`)
      .addField("How to setup Bedibot", `Run ${surroundStringWithBackTick(settingsData.prefix + 'settings')} to setup all of the features offed by BediBot`)
      .addField("Server Name:", `**${guild_object.name}**`)
      .addField("Server ID:", `\`\`\`${guild_object.id}\`\`\``)
    return channel?.send({embeds: [embed]})

  }
};