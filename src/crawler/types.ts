import type { PlaywrightCrawlingContext, RouterHandler } from 'crawlee';

export type CrawlerHandler = Parameters<
    RouterHandler<PlaywrightCrawlingContext>['addHandler']
>[1] & {
    LABEL: string;
};

export type CrawlerHandlerPage = Parameters<CrawlerHandler>[0]['page'];

export type Course = {
    id: number;
    name: string;
    Discipline: Discipline[];
};

export type Discipline = {
    id: number;
    name: string;
    course_id: number;
    Activity: Activity[];
};

export type Activity = {
    id: number;
    name: string;
    start_date: Date;
    end_date: Date;
    discipline_id: number;
};
