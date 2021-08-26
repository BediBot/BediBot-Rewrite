import {SentMessageInfo} from 'nodemailer';

import logger from './loggerUtil';

require('dotenv').config({path: '../.env'});

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');

const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.EMAIL_CLIENT_ID,
                clientSecret: process.env.EMAIL_CLIENT_SECRET,
                refreshToken: process.env.EMAIL_CLIENT_REFRESH,
        },
});

const oAuth2Client =
    new OAuth2(process.env.EMAIL_CLIENT_ID, process.env.EMAIL_CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
oAuth2Client.setCredentials({
        refresh_token: process.env.EMAIL_CLIENT_REFRESH,
});

/**
 * Sends an email with given parameters
 * @param toAddress
 * @param subject
 * @param text
 * @param htmlText
 */
const sendMail = (toAddress: string, subject: string, text: string, htmlText: string) => {
        const mailOptions = {
                from: process.env.EMAIL_USER,
                to: toAddress,
                subject: subject,
                text: text,
                html: htmlText,
                auth: {
                        accessToken: oAuth2Client.getAccessToken(),
                },
        };

        let response: (Error|null)|SentMessageInfo;

        transporter.sendMail(mailOptions, function(error: Error|null, info: SentMessageInfo) {
                if (error) {
                        logger.error(error);
                        response = error;
                } else {
                        response = info;
                }
        });

        return response;
};

const generateHTMLConfirmationEmail = async (serverName: string, serverPrefix: string, uniqueKey: string) => {
        const filePath = path.join(__dirname, './../../confirmTemplate.html');
        const response = await fs.readFileSync(filePath);

        return Mustache.render(response.toString(), {
                serverPrefix: serverPrefix,
                uniqueKey: uniqueKey,
                serverName: serverName,
        });
};

/**
 * Sends a confirmation email with the specified parameters for verification
 * @param toAddress
 * @param serverName
 * @param serverPrefix
 * @param uniqueKey
 */
export const sendConfirmationEmail = async (toAddress: string, serverName: string, serverPrefix: string, uniqueKey: string) => {
        const text =
            `Please verify your email address by typing ${serverPrefix}confirm ${uniqueKey} in the ${serverName} server!`;

        const htmlText = await generateHTMLConfirmationEmail(serverName, serverPrefix, uniqueKey);

        return sendMail(toAddress, 'BediBot Verification', text, htmlText);
};

/**
 * Checks if an email address follows proper format.
 * @param emailAddress
 * @returns {boolean}
 */
export const isEmailValid = (emailAddress: string) => {
        const re = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]+)$/;
        return re.test(emailAddress);
};

/**
 * Generates a random string of length numBytes * 2
 * @returns {string}
 */
export const createUniqueKey = () => {
        const numBytes = 10;
        return crypto.randomBytes(numBytes).toString('hex');
};