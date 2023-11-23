import { type PlaywrightHook } from 'crawlee';

import { type CrawlerHandlerPage, config } from '~/crawler';

export const logRequestLabel: PlaywrightHook = ({ log, request }) => {
    log.info(`Executing to label ${request.label ?? 'default'}`);
};

export function setPageCustomTimeout(page: CrawlerHandlerPage) {
    page.setDefaultTimeout(config.locatorTimeout);
}

export async function waitForTimeout(timeout: number) {
    await new Promise(resolve => setTimeout(resolve, timeout));
}

export function removeSpaceAroundText<T extends string | null>(text: T): T {
    return text?.replace(/\s*(\S+(\s\S+)*)\s*/gm, '$1') as T;
}
