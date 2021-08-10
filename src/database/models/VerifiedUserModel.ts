import {model, Schema} from 'mongoose';

export const VerifiedUser = new Schema({
  guildId: String,
  userID: Number,
  emailHash: String,
});

export default model('VerifiedUser', VerifiedUser, 'VerifiedUsers');