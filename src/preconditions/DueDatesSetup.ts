import {Precondition} from '@sapphire/framework';
import {Message} from 'discord.js';
import {getSettings} from '../database/models/SettingsModel';
import {surroundStringWithBackTick} from '../utils/discordUtil';

export class DueDatesSetupPrecondition extends Precondition {
  public async run(message: Message) {
    const {guildId} = message;

    const settingsData = await getSettings(guildId as string);

    if (settingsData.types.length === 0) {
      return this.error({
        message: `Your server has no due date types setup. Ask an admin to add some with ${surroundStringWithBackTick(
            settingsData.prefix + 'setTypes')}`,
      });
    }

    if (settingsData.categories.length === 0) {
      return this.error({
        message: `Your server has no due date categories setup. Ask an admin to add some with ${surroundStringWithBackTick(
            settingsData.prefix + 'setCategories')}`,
      });
    }

    if (settingsData.courses.length === 0) {
      return this.error({
        message: `Your server has no due date courses setup. Ask an admin to add some with ${surroundStringWithBackTick(
            settingsData.prefix + 'setCourses')}`,
      });
    }

    return this.ok();
  }
}