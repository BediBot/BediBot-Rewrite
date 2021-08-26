import {LogLevel} from '@sapphire/framework';
import {ClientOptions, Intents} from 'discord.js';

import {fetchPrefix} from './utils/discordUtil';
import {getRandomStatus} from './utils/statusUtil';

export const DEFAULT_PREFIX = '$';

export const CLIENT_OPTIONS: ClientOptions = {
        intents: [
                Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS
        ],
        defaultPrefix: DEFAULT_PREFIX,
        caseInsensitiveCommands: true,
        caseInsensitivePrefixes: true,
        presence: getRandomStatus(),
        logger: {
                level: LogLevel.None,
        },
        partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
        fetchPrefix: fetchPrefix,
};
