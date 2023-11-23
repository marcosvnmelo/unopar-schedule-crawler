import { crawler, config } from '~/crawler';
import { prisma } from '~/services/prisma';
import { saveToXlsx } from '~/services/xlsx';

await prisma.course.deleteMany();

const startUrls = [config.loginUrl];

await crawler.run(startUrls);

const allCourses = await prisma.course.findMany({
    include: {
        Discipline: {
            include: {
                Activity: true,
            },
        },
    },
});

await saveToXlsx(allCourses);

await prisma.$disconnect();

process.exit();
