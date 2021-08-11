import {model, Schema} from 'mongoose';

export const VerifiedUser = new Schema({
  userId: Number,
  guildId: String,
  emailHash: String,
  birthdate: Date,
});

export default model('VerifiedUser', VerifiedUser, 'VerifiedUsers');