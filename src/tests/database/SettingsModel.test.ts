import SettingsModel, {defaultSettings, getSettings} from '../../database/models/SettingsModel';
import mongoose from 'mongoose';

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

  test('Settings Already Exist', async () => {
    const guildId = 'randomString';
    const doc = defaultSettings(guildId);
    await SettingsModel.create(doc);
    const result = await getSettings(guildId);
    expect(result._id).toBe(doc._id);
    expect(result.prefix).toBe(doc.prefix);
    expect(result.timezone).toBe(doc.timezone);
    expect(result.pinsEnabled).toBe(doc.pinsEnabled);
    expect(result.quotesEnabled).toBe(doc.quotesEnabled);
    expect(result.verificationEnabled).toBe(doc.verificationEnabled);
    expect(result.birthdayAnnouncementsEnabled).toBe(doc.birthdayAnnouncementsEnabled);
    expect(result.morningAnnouncementsEnabled).toBe(doc.morningAnnouncementsEnabled);
    expect(result.dueDatesEnabled).toBe(doc.dueDatesEnabled);
  });

  test('Settings Dont Exist', async () => {
    const guildId = 'randomString';
    const doc = defaultSettings(guildId);
    const result = await getSettings(guildId);
    expect(result._id).toBe(doc._id);
    expect(result.prefix).toBe(doc.prefix);
    expect(result.timezone).toBe(doc.timezone);
    expect(result.pinsEnabled).toBe(doc.pinsEnabled);
    expect(result.quotesEnabled).toBe(doc.quotesEnabled);
    expect(result.verificationEnabled).toBe(doc.verificationEnabled);
    expect(result.birthdayAnnouncementsEnabled).toBe(doc.birthdayAnnouncementsEnabled);
    expect(result.morningAnnouncementsEnabled).toBe(doc.morningAnnouncementsEnabled);
    expect(result.dueDatesEnabled).toBe(doc.dueDatesEnabled);
  });
});