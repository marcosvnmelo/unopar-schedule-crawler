import dotenv from 'dotenv';

dotenv.config();

if (!process.env.USER_LOGIN || !process.env.USER_PASSWORD) {
    throw new Error('Missing USER_LOGIN or USER_PASSWORD env var');
}

export const config = {
    userLogin: process.env.USER_LOGIN,
    userPassword: process.env.USER_PASSWORD,
    url: 'https://www.colaboraread.com.br',
    get loginUrl() {
        return `${this.url}/login/auth`;
    },
    locatorTimeout: 30 * 1000,
};
