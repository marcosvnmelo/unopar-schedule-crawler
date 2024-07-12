import type { Source } from 'crawlee';
import type { Locator } from 'playwright';

import {
    courseBoxLocator,
    courseNameLocator,
    courseNavigationFormLocator,
    courseNavigationFormSelectLocator,
    courseTitleLocator,
} from '~/course/course.locators';
import {
    config,
    type CrawlerHandler,
    type CrawlerHandlerPage,
} from '~/crawler';
import { disciplineHandler } from '~/discipline/discipline.handler';
import { disciplineNameLocator } from '~/discipline/discipline.locators';
import { prisma } from '~/libs/prisma';
import { removeSpaceAroundText } from '~/utils';

const courseHandler: CrawlerHandler = async ({
    page,
    request,
    log,
    crawler,
}) => {
    const { courseIndex } = request.userData;

    await page.waitForLoadState('networkidle');

    const courseBox = page.locator(courseBoxLocator).nth(courseIndex);

    await courseBox.waitFor();

    const boxTitle = await courseBox.locator(courseTitleLocator).textContent();

    if (!boxTitle || removeSpaceAroundText(boxTitle) !== 'Curso') return;

    const courseName = await courseBox.locator(courseNameLocator).textContent();

    if (!courseName) {
        log.error('course name not found');
        return;
    }

    log.info(`Reading course: ${courseName}`);

    await navigateToCourse(courseBox, page);

    const disciplinesLocator = page.locator(disciplineNameLocator);

    await disciplinesLocator.first().waitFor();

    const { id: courseId } = await prisma.course.create({
        data: {
            name: courseName,
        },
    });

    const disciplines = await disciplinesLocator.all();

    const disciplineRequests: Source[] = [];

    for await (const discipline of disciplines) {
        const [disciplineName, disciplinePath] = await Promise.all([
            discipline.textContent(),
            discipline.getAttribute('href'),
        ]);

        const disciplineIndex = disciplineRequests.length;

        disciplineRequests.push({
            url: `${config.url}${disciplinePath}`,
            label: disciplineHandler.LABEL,
            uniqueKey: `${disciplineHandler.LABEL}-${disciplineIndex}`,
            userData: {
                courseId,
                courseName,
                disciplineName: removeSpaceAroundText(disciplineName),
            },
        });
    }

    await crawler.addRequests(disciplineRequests);
};

courseHandler.LABEL = 'course';

export { courseHandler };

async function navigateToCourse(courseBox: Locator, page: CrawlerHandlerPage) {
    const navigationFormLocator = courseBox.locator(
        courseNavigationFormLocator,
    );

    const navigationFormSelectLocator = navigationFormLocator.locator(
        courseNavigationFormSelectLocator,
    );

    const navigationFormUrl =
        await navigationFormLocator.getAttribute('action');

    const navigationFormSelectName =
        await navigationFormSelectLocator.getAttribute('name');

    const navigationFormSelectOptionValue = await navigationFormSelectLocator
        .locator('option')
        .first()
        .getAttribute('value');

    const courseUrl = `${config.url}${navigationFormUrl}?${navigationFormSelectName}=${navigationFormSelectOptionValue}`;

    await page.goto(courseUrl);

    await page.waitForLoadState('networkidle');
}
