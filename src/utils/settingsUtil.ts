import {Formatters} from 'discord.js';

import {capFirstLetterEveryWord} from './stringsUtil';

// Array of settings modules
const modules = ['verification', 'quotes', 'pins', 'due dates'];

/**
 * Creates a pretty string to represent modules in the $settings command embed.
 *
 * @return {string} A pretty string representation of all settings modules.
 */
export const listModulesString = () => {
    const copy = [...modules];

    for (let i = 0; i < copy.length; i++) {
        copy[i] = Formatters.inlineCode(capFirstLetterEveryWord(copy[i]));
    }

    return copy.join(' ');
};