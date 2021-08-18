import mongoose from 'mongoose';
import birthdayModel, {updateBirthday} from '../../database/models/BirthdayModel';

describe('Birthday DB', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL + 'Birthdays' as string, {
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

  test('updateBirthday', async () => {
    const userId = 'randomID';
    const birthday = new Date();

    expect(await birthdayModel.findOne({userId: userId})).toBeNull();

    await updateBirthday(userId, birthday);

    let result = await birthdayModel.findById(userId);
    expect(result?.birthDate.toString()).toBe(birthday.toString());

    birthday.setFullYear(birthday.getFullYear() + 1);

    await updateBirthday(userId, birthday);

    result = await birthdayModel.findById(userId);
    expect(result?.birthDate.toString()).toBe(birthday.toString());
  });
});