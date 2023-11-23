// For more information, see https://crawlee.dev
import { PlaywrightCrawler } from 'crawlee';

import { router as requestHandler } from './routes';

import { logRequestLabel, setPageCustomTimeout } from '~/utils';

export const crawler = new PlaywrightCrawler({
    headless: true,
    requestHandler,
    postNavigationHooks: [logRequestLabel],
    useSessionPool: false,
    browserPoolOptions: {
        useFingerprints: false,
        postPageCreateHooks: [setPageCustomTimeout],
    },
});

export * from '~/crawler/config';
export * from '~/crawler/types';
