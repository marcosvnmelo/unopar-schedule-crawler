import { createPlaywrightRouter } from 'crawlee';

import { courseHandler } from '~/course/course.handler';
import { courseBoxLocator } from '~/course/course.locators';
import { config } from '~/crawler/config';
import { disciplineHandler } from '~/discipline/discipline.handler';
import {
    loginButtonLocator,
    loginInputLocator,
    passwordInputLocator,
} from '~/locators';
import { waitForTimeout } from '~/utils';

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ log, page, crawler }) => {
    await page.waitForLoadState('networkidle');

    if (page.url() === config.url) {
        log.info('already logged in');
        return;
    }

    log.info('login');

    const loginInput = page.locator(loginInputLocator);
    const passwordInput = page.locator(passwordInputLocator);
    const loginButton = page.locator(loginButtonLocator);

    await loginInput.waitFor();

    await loginInput.fill(config.userLogin);

    await passwordInput.fill(config.userPassword);

    await loginButton.click();

    await waitForTimeout(1000);

    await page.goto(config.url);

    const courseBoxesLocator = page.locator(courseBoxLocator);

    await courseBoxesLocator.first().waitFor();

    const courseBoxes = await courseBoxesLocator.all();

    log.info(`Found ${courseBoxes.length - 1} course(s)`);

    await crawler.addRequests(
        courseBoxes.map((_, courseIndex) => ({
            url: config.url,
            label: courseHandler.LABEL,
            uniqueKey: `${courseHandler.LABEL}-${courseIndex}`,
            userData: {
                courseIndex,
            },
        })),
    );
});

router.addHandler(courseHandler.LABEL, courseHandler);

router.addHandler(disciplineHandler.LABEL, disciplineHandler);
