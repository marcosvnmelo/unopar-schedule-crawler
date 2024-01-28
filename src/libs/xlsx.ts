import fs from 'node:fs/promises';

import xlsx from 'node-xlsx';

import type { Activity, Course, Discipline } from '~/crawler';

if (!process.env.XLS_FILE_NAME) {
    throw new Error('XLS_FILE_NAME not set');
}

export async function saveToXlsx(data: Course[]) {
    const buffer = xlsx.build(
        data.map(course => ({
            name: course.name.slice(0, 30),
            data: [
                ['Matéria', 'Atividade', 'Início', 'Fim'],
                ...formatData(course.Discipline),
            ],
            options: {},
        })),
    );

    await fs.writeFile(`${process.env.XLS_FILE_NAME}.xlsx`, buffer);
}

function formatData(data: Discipline[]): string[][] {
    const allActivities = data.flatMap(discipline =>
        discipline.Activity.map(activity => ({
            ...activity,
            disciplineName: discipline.name,
        })),
    );

    const sortedActivities = orderByEndDate(allActivities);

    return sortedActivities.map(activity => [
        activity.disciplineName,
        formatActivityName(activity.name, activity.disciplineName),
        formatDate(activity.start_date),
        formatDate(activity.end_date),
    ]);
}

function formatActivityName(name: string, disciplineName: string): string {
    const replaceMap = new Map<RegExp, string>([
        [/^Ta(.*)/, 'Teleaula $1'],
        [/^Av -Subst.(.*)/, 'Avaliação Virtual Substituta$1'],
        [/^Av(.*)/, 'Avaliação Virtual $1'],
        [/^Cw(.*)/, 'Conteúdo WEB $1'],
        [/^Eng Ava(.*)/, 'Engajamento AVA $1'],
        [/^Leitura(.*)/, 'Leitura $1'],
    ]);

    const replaceKeys = Array.from(replaceMap.keys());

    const nameWithoutDisciplineName = name.replace(` - ${disciplineName}`, '');

    for (const key of replaceKeys) {
        if (key.test(nameWithoutDisciplineName)) {
            return nameWithoutDisciplineName.replace(key, replaceMap.get(key)!);
        }
    }

    return nameWithoutDisciplineName;
}

function formatDate(date: Date) {
    let day: string | number = date.getUTCDate();
    let month: string | number = date.getUTCMonth() + 1;
    const year = date.getFullYear();

    if (day < 10) day = `0${day}`;
    if (month < 10) month = `0${month}`;

    return `${day}/${month}/${year}`;
}

function orderByEndDate<T extends Activity>(data: T[]): T[] {
    return data.sort((a, b) => {
        const dateA = new Date(a.end_date);
        const dateB = new Date(b.end_date);

        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;

        return 0;
    });
}
