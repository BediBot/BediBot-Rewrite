import {model, Schema} from 'mongoose';

interface SettingsI {
  _id: string, // Guild ID
  prefix: string,
  timezone: string,
  verificationEnabled: boolean,
  pinsEnabled: boolean,
  quotesEnabled: boolean,
  birthdayAnnouncementsEnabled: boolean,
  morningAnnouncementsEnabled: boolean,
  dueDatesEnabled: boolean,
  emailDomain: string,
  verifiedRole: string,
  pinEmoji: string,
  quoteApprovalsRequired: number,
}

export const Settings = new Schema({
  _id: String, // Guild ID
  prefix: String,
  timezone: String,
  verificationEnabled: Boolean,
  pinsEnabled: Boolean,
  quotesEnabled: Boolean,
  birthdayAnnouncementsEnabled: Boolean,
  morningAnnouncementsEnabled: Boolean,
  dueDatesEnabled: Boolean,
  emailDomain: String,
  verifiedRole: String,
  pinEmoji: String,
  quoteApprovalsRequired: String,
});

export const defaultSettings = (guildID: string) => {
  return {
    _id: guildID,
    prefix: '$',
    timezone: 'America/Toronto',
    pinsEnabled: false,
    quotesEnabled: false,
    verificationEnabled: true,
    birthdayAnnouncementsEnabled: false,
    morningAnnouncementsEnabled: false,
    dueDatesEnabled: false,
    emailDomain: 'uwaterloo.ca',
    verifiedRole: 'Verified',
    pinEmoji: '📌',
    quoteApprovalsRequired: 4,
  };
};

const settingsModel = model<SettingsI>('Settings', Settings, 'Settings');

/**
 * Gets the settings for a given guild
 * @param guildId
 * @returns {Promise<SettingsI & Document<any, any, SettingsI>>}
 */
export const getSettings = async (guildId: string) => {
  let settingsData = await settingsModel.findOne({_id: guildId});

  return settingsData ?? await settingsModel.create(defaultSettings(guildId as string));
};

export default settingsModel;

