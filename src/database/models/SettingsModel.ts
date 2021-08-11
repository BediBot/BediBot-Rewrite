import {model, Schema} from 'mongoose';

export const Settings = new Schema({
  _id: String,
  prefix: String,
  timezone: String,
  verificationEnabled: Boolean,
  birthdayAnnouncementsEnabled: Boolean,
  morningAnnouncementsEnabled: Boolean,
  dueDatesEnabled: Boolean,
  pinsEnabled: Boolean,
});

export const defaultSettings = (guildID: string) => {
  return {
    guildId: guildID,
    prefix: '$',
    timezone: 'America/Toronto',
    verificationEnabled: false,
    birthdayAnnouncementEnabled: false,
    morningAnnouncementsEnabled: false,
    dueDatesEnabled: false,
    pinsEnabled: false,
  };
};

export default model('Settings', Settings, 'Settings');

