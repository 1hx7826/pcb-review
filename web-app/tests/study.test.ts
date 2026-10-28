import {describe,it,expect} from 'vitest';
import {emptyStudy,validateStudy,mergeStudy,schedule,wrongQuestions,updateStudy,readStudy,readBackup,type Study} from '../src/study';
import {lessons,questions,course} from '../src/course';
import 'fake-indexeddb/auto';
describe('source-grounded course',()=>{
 it('retains existing numbering and source coverage',()=>{expect(lessons).toHaveLength(26);expect(lessons.map(l=>l.number)).not.toContain(19);expect(lessons.map(l=>l.number)).not.toContain(22);expect(course.sources).toHaveLength(39);for(const l of lessons)expect(course.sources.some(s=>s.path===l.source.file)).toBe(true)});
 it('has distinct questions, valid keys and useful operational criteria',()=>{expect(new Set(questions.map(q=>q.id)).size).toBe(52);for(const q of questions){expect(q.answer).toBeGreaterThanOrEqual(0);expect(q.answer).toBeLessThan(q.options.length);expect(new Set(q.options).size).toBe(3)}for(const l of lessons){expect(l.steps).toHaveLength(3);for(const s of l.steps)expect(s.success.length).toBeGreaterThan(8)}});
 it('identifies sparse lessons and documents rather than hiding gaps',()=>{expect(lessons.find(l=>l.number===18)!.notice).toContain('补充');expect(course.gaps.join('')).toContain('19、22');expect(course.projects).toHaveLength(2)});
});
describe('study data and scheduling',()=>{
 it('round-trips an empty backup',()=>expect(validateStudy(JSON.parse(JSON.stringify(emptyStudy())))).toEqual(emptyStudy()));
 it.each([{},null,{...emptyStudy(),format:'stm32-review'},{...emptyStudy(),version:2},{...emptyStudy(),lastLesson:'l19'},{...emptyStudy(),lessons:{l1:{done:true,note:'',at:1,checks:['step99']}}},{...emptyStudy(),reviews:{c1:{at:100,due:99,days:1,rating:'good'}}},{...emptyStudy(),answers:[{id:'x',questionId:'q1-1',choice:99,at:1}]}])('rejects malformed or foreign backup %#',bad=>expect(()=>validateStudy(bad)).toThrow());
 it('does not trust extra imported properties',()=>expect(validateStudy({...emptyStudy(),private:'secret'})).not.toHaveProperty('private'));
 it('keeps wrong questions until corrected, using the answer key',()=>{const q=questions[0],s=emptyStudy();s.answers=[{id:'a',questionId:q.id,choice:(q.answer+1)%3,at:10}];expect(wrongQuestions(s).map(x=>x.id)).toContain(q.id);s.answers.push({id:'b',questionId:q.id,choice:q.answer,at:11});expect(wrongQuestions(s)).toHaveLength(0)});
 it('merges newer lesson entries and deduplicates attempts',()=>{const a=emptyStudy(),b=emptyStudy();a.lessons.l1={done:false,note:'new',at:20,checks:['step1']};b.lessons.l1={done:true,note:'old',at:10,checks:[]};a.answers=[{id:'x',questionId:questions[0].id,choice:0,at:1}];b.answers=[...a.answers,{id:'y',questionId:questions[1].id,choice:0,at:2}];const m=mergeStudy(a,b);expect(m.lessons.l1.note).toBe('new');expect(m.answers).toHaveLength(2);expect(mergeStudy(m,b)).toEqual(m)});
 it('schedules failure ten minutes later',()=>expect(schedule(undefined,'again',1000).due).toBe(601000));
 it('advances only due successful reviews and caps at 30 days',()=>{let r=schedule(undefined,'good',100);expect(r.days).toBe(1);expect(schedule(r,'good',200).due).toBe(r.due);r=schedule(r,'good',r.due);expect(r.days).toBe(3);for(let i=0;i<8;i++)r=schedule(r,'good',r.due);expect(r.days).toBe(30)});
 it('resets a previously learned card after failure',()=>{const p=schedule(undefined,'good',100);expect(schedule(p,'again',200)).toMatchObject({days:0,due:600200})});
});
describe('transactional browser storage',()=>{
 it('preserves concurrent changes and stores a pre-import backup',async()=>{await Promise.all([updateStudy(s=>({...s,lastLesson:'l2'})),updateStudy(s=>({...s,lessons:{...s.lessons,l1:{done:true,note:'test',at:1,checks:[]}}}))]);const s=await readStudy();expect(s.lastLesson).toBe('l2');expect(s.lessons.l1.done).toBe(true);await updateStudy(v=>({...v,lastLesson:'l3'}),true);expect((await readBackup())!.lastLesson).toBe('l2');expect((await readStudy()).lastLesson).toBe('l3')});
 it('an aborted edit leaves the saved record intact',async()=>{const before=await readStudy();await expect(updateStudy(()=>{throw Error('no change')})).rejects.toThrow();expect(await readStudy()).toEqual(before)});
});
