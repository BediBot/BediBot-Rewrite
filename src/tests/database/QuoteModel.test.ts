import mongoose from 'mongoose';
import quoteModel, {getQuotesFromAuthor} from '../../database/models/QuoteModel';

describe('Settings DB', () => {
        beforeAll(async () => {
                await mongoose.connect(process.env.MONGO_URL + 'settings' as string, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        useFindAndModify: false,
                });
        });

        afterEach(async () => {
                await mongoose.connection.db.dropDatabase();
        });

        afterAll(async () => {
                await mongoose.connection.close();
        });

        test('getQuotesFromAuthor', async () => {
                const guildId = 'randomGuild';
                const name = 'randomAuthor';
                const quote = 'randomQuote';
                const date = new Date();
                const numQuotes = 10;

                let result = await getQuotesFromAuthor(guildId, name);
                expect(result.length).toBe(0);

                for (let i = 0; i < numQuotes; i++) {
                        await quoteModel.create({
                                guildId: guildId,
                                name: name,
                                quote: quote,
                                date: date,
                        });
                }

                result = await getQuotesFromAuthor(guildId, name);
                expect(result.length).toBe(numQuotes);

                for (let i = 0; i < numQuotes; i++) {
                        expect(result[i].quote).toBe(quote);
                }
        });
});