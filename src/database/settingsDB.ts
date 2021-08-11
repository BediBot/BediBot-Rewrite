import SettingsModel, {defaultSettings} from './models/SettingsModel';

export const getSettings = async (guildId: string) => {
  let settingsData = await SettingsModel.findOne({_id: guildId});

  if (!settingsData) settingsData = await SettingsModel.create(defaultSettings(guildId as string));

  return settingsData;
};
