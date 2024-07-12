import type { Prisma } from '@prisma/client';

import { type CrawlerHandler } from '~/crawler';
import {
    disciplinePanelLocator,
    disciplinePanelTimeLocator,
    disciplinePanelTitleLocator,
} from '~/discipline/discipline.locators';
import { prisma } from '~/libs/prisma';
import { removeSpaceAroundText } from '~/utils';

const disciplineHandler: CrawlerHandler = async ({ page, request, log }) => {
    const { courseId, courseName, disciplineName } = request.userData;

    log.info(`Reading discipline: '${disciplineName}' from '${courseName}'`);

    await page.waitForLoadState('networkidle');

    const panelsLocator = page.locator(disciplinePanelLocator);

    await panelsLocator.first().waitFor();

    const { id: disciplineId } = await prisma.discipline.create({
        data: {
            name: disciplineName,
            course: {
                connect: {
                    id: courseId,
                },
            },
        },
    });

    const panels = await panelsLocator.all();

    const operations: Prisma.PrismaPromise<unknown>[] = [];

    for await (const panel of panels) {
        const [panelTitle, panelTime] = await Promise.all([
            panel.locator(disciplinePanelTitleLocator).textContent(),
            panel.locator(disciplinePanelTimeLocator).textContent(),
        ]);

        if (!panelTitle) {
            log.error('panel title not found');
            continue;
        }

        if (!panelTime) {
            log.error('panel time not found');
            continue;
        }

        const [startDate, endDate] = splitDateRange(panelTime);

        operations.push(
            prisma.activity.create({
                data: {
                    name: removeSpaceAroundText(panelTitle),
                    start_date: startDate,
                    end_date: endDate,
                    discipline: {
                        connect: {
                            id: disciplineId,
                        },
                    },
                },
            }),
        );
    }

    await prisma.$transaction(operations);
};

disciplineHandler.LABEL = 'discipline';

export { disciplineHandler };

function splitDateRange(dateRange: string) {
    const [startDate, endDate] = dateRange.split(' - ');

    return [formatDate(startDate), formatDate(endDate)];
}

function formatDate(date: string) {
    const [day, month, year] = date.split('/');

    return new Date(`20${year}-${month}-${day}`);
}
