import mongoose from 'mongoose';
import pendingVerificationUserModel, {emailAddressLinkedToPendingVerificationUser, emailHashFromPendingUser, userPendingVerification, validUniqueKey,} from '../../database/models/PendingVerificationuserModel';
import {hashString} from '../../utils/hashUtil';

describe('PendingVerification DB', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL + 'pendingVerification' as string, {
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

    test('emailAddressLinkedToPendingVerificationUser', async () => {
        const email = 'randomString@gmail.com';
        const uniqueKey = 'randomKey';
        const guildId = 'randomGuildID';
        const userId = 'randomUserId';

        expect(await emailAddressLinkedToPendingVerificationUser(email)).toBe(false);

        await pendingVerificationUserModel.create({
            emailHash: await hashString(email.substring(0, email.indexOf('@'))),
            uniqueKey: uniqueKey,
            guildId: guildId,
            userId: userId,
        });

        expect(await emailAddressLinkedToPendingVerificationUser(email)).toBe(true);
    });

    test('userPendingVerification', async () => {
        const userId = 'randomUserID';
        const guildId = 'randomGuildID';
        const uniqueKey = 'randomKey';
        const emailHash = 'randomHash';

        expect(await userPendingVerification(userId, guildId)).toBe(false);

        await pendingVerificationUserModel.create({
            userId: userId,
            guildId: guildId,
            uniqueKey: uniqueKey,
            emailHash: emailHash,
        });

        expect(await userPendingVerification(userId, guildId)).toBe(true);
    });

    test('validUniqueKey', async () => {
        const userId = 'randomUserID';
        const guildId = 'randomGuildID';
        const uniqueKey = 'randomUniqueKey';
        const emailHash = 'randomEmailHash';

        expect(await validUniqueKey(userId, guildId, uniqueKey)).toBe(false);

        await pendingVerificationUserModel.create({
            userId: userId,
            guildId: guildId,
            uniqueKey: uniqueKey,
            emailHash: emailHash,
        });

        expect(await validUniqueKey(userId, guildId, uniqueKey)).toBe(true);
    });

    test('emailHashFromPendingUser', async () => {
        const userId = 'randomUserID';
        const guildId = 'randomGuildID';
        const emailHash = 'randomEmailHash';
        const uniqueKey = 'randomUniqueKey';

        await pendingVerificationUserModel.create({
            userId: userId,
            guildId: guildId,
            emailHash: emailHash,
            uniqueKey: uniqueKey,
        });

        expect(await emailHashFromPendingUser(userId, guildId)).toBe(emailHash);
    });
});