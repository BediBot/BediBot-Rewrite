import {model, Schema} from 'mongoose';

export const GuildSettings = new Schema({
  guildId: Number,
  timezone: String,
  verificationEnabled: Boolean,
  birthdayAnnouncementsEnabled: Boolean,
  morningAnnouncementsEnabled: Boolean,
  dueDatesEnabled: Boolean,
  pinsEnabled: Boolean,
});

export default model('guildSettings', GuildSettings);