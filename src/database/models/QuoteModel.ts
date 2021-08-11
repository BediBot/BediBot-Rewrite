import {model, Schema} from 'mongoose';

export const Quote = new Schema({
  guildId: String,
  quote: String,
  author: String,
});

export default model('Quote', Quote, 'Quotes');