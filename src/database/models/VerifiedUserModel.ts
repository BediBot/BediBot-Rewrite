import {model, Schema} from 'mongoose';

export const VerifiedUser = new Schema({
  guildID: String,
  userID: Number,
  emailHash: String,
});

export default model('verifiedUser', VerifiedUser);