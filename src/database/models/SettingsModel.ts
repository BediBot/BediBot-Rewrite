import {model, Schema} from 'mongoose';

export const Settings = new Schema({
  _id: String, // Guild ID
  prefix: String,
  timezone: String,
  verificationEnabled: Boolean,
  pinsEnabled: Boolean,
  quotesEnabled: false,
  birthdayAnnouncementsEnabled: Boolean,
  morningAnnouncementsEnabled: Boolean,
  dueDatesEnabled: Boolean,
});

export const defaultSettings = (guildID: string) => {
  return {
    _id: guildID,
    prefix: '$',
    timezone: 'America/Toronto',
    pinsEnabled: false,
    quotesEnabled: false,
    verificationEnabled: false,
    birthdayAnnouncementsEnabled: false,
    morningAnnouncementsEnabled: false,
    dueDatesEnabled: false,
  };
};

export default model('Settings', Settings, 'Settings');

