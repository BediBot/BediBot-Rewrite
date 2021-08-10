import {model, Schema} from 'mongoose';

export const Quote = new Schema({
  guildId: Number,
  quote: String,
  author: String,
});

export default model('quote', Quote);