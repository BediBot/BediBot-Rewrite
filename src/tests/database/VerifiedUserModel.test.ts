import mongoose from 'mongoose';
import {hashString} from '../../utils/hashUtil';
import verifiedUserModel, {emailAddressLinkedToUser} from '../../database/models/VerifiedUserModel';

describe('VerifiedUsers DB', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL + 'VerifiedUsers' as string, {
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

  test('emailAddressLinkedToUser', async () => {
    const emailAddress = 'randomString';
    const guildId = 'randomGuildId';

    expect(await emailAddressLinkedToUser(emailAddress, guildId)).toBe(false);

    await verifiedUserModel.create({
      emailHash: await hashString(emailAddress),
      guildId: guildId,
    });

    expect(await emailAddressLinkedToUser(emailAddress, guildId)).toBe(true);
    expect(await emailAddressLinkedToUser(emailAddress, 'wrongGuildId')).toBe(false);
  });
});