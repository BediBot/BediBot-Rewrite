import {model, Schema} from 'mongoose';

interface QuoteI {
  guildId: string,
  quote: string,
  author: string,
}

export const Quote = new Schema({
  guildId: String,
  quote: String,
  author: String,
});

const quoteModel = model<QuoteI>('Quote', Quote, 'Quotes');

export default quoteModel;