import raw from '../../content/course.json';
export const course=raw;
export type Lesson=typeof course.lessons[number];
export type Question=Lesson['questions'][number];
export const lessons=course.lessons;
export const groups=[...new Set(lessons.map(l=>l.group))];
export const questions=lessons.flatMap(l=>l.questions);
export const cards=lessons.map(l=>l.card);
export const lessonById=(id:string)=>lessons.find(l=>l.id===id);
