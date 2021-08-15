import logger from './loggerUtil';
import {PresenceData} from 'discord.js';

var statuses = [
    {status: 'online', activities: [{type: 'LISTENING', name: '$help'}]},
]

export const getRandomStatus = () => {
    const random_int = Math.floor(Math.random() * 3);
    const status_picked = statuses[0];
    return status_picked
    
}