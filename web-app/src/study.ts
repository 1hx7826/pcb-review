import {lessons,questions,cards} from './course';
export type Answer={id:string;questionId:string;choice:number;at:number};
export type Review={at:number;due:number;days:number;rating:'again'|'hard'|'good'};
export type Entry={done:boolean;note:string;checks:string[];at:number};
export type Study={format:'pcb-study';version:1;lessons:Record<string,Entry>;answers:Answer[];reviews:Record<string,Review>;lastLesson:string};
export const emptyStudy=():Study=>({format:'pcb-study',version:1,lessons:{},answers:[],reviews:{},lastLesson:'l1'});
const lessonIds=new Set(lessons.map(l=>l.id));
const qMap=new Map(questions.map(q=>[q.id,q]));
const cardIds=new Set(cards.map(c=>c.id));
export const latestAnswers=(s:Study)=>Object.fromEntries([...s.answers].sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id)).map(a=>[a.questionId,a]));
export const wrongQuestions=(s:Study)=>questions.filter(q=>{const a=latestAnswers(s)[q.id];return a&&a.choice!==q.answer;});
export function schedule(prior:Review|undefined,rating:Review['rating'],at=Date.now()):Review{
 if(rating==='again')return {at,due:at+600000,days:0,rating};
 if(prior&&prior.due>at)return {...prior,at,rating};
 const days=rating==='hard'?1:[1,3,7,14,30].find(n=>n>(prior?.days||0))??30;
 return {at,due:at+days*86400000,days,rating};
}
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const validTime=(v:unknown):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0&&v<=8640000000000000;
export function validateStudy(v:unknown):Study{
 if(!obj(v)||v.format!=='pcb-study'||v.version!==1||!obj(v.lessons)||!obj(v.reviews)||!Array.isArray(v.answers)||v.answers.length>100000||!lessonIds.has(String(v.lastLesson)))throw Error('文件不是有效的PCB学习台v1备份。');
 for(const [id,e] of Object.entries(v.lessons)){
  if(!lessonIds.has(id)||!obj(e)||typeof e.done!=='boolean'||typeof e.note!=='string'||e.note.length>20000||!validTime(e.at)||!Array.isArray(e.checks)||e.checks.some(c=>typeof c!=='string'||!/^step[0-2]$/.test(c))||new Set(e.checks).size!==e.checks.length)throw Error('备份的课程记录格式不正确。');
 }
 const ids=new Set<string>();
 for(const a of v.answers){
  if(!obj(a)||typeof a.id!=='string'||a.id.length>120||ids.has(a.id)||!qMap.has(String(a.questionId))||!Number.isInteger(a.choice)||Number(a.choice)<0||Number(a.choice)>=qMap.get(String(a.questionId))!.options.length||!validTime(a.at))throw Error('备份的答题记录格式不正确。');
  ids.add(a.id);
 }
 for(const [id,r] of Object.entries(v.reviews)){
  if(!cardIds.has(id)||!obj(r)||!validTime(r.at)||!validTime(r.due)||r.due<r.at||![0,1,3,7,14,30].includes(Number(r.days))||!['again','hard','good'].includes(String(r.rating)))throw Error('备份的复习记录格式不正确。');
 }
 // Reconstruct allowlisted properties to discard extraneous imported fields.
 return {format:'pcb-study',version:1,lastLesson:String(v.lastLesson),lessons:Object.fromEntries(Object.entries(v.lessons).map(([id,e])=>{const x=e as Entry;return[id,{done:x.done,note:x.note,checks:[...x.checks],at:x.at}]})),answers:v.answers.map(a=>{const x=a as Answer;return {id:x.id,questionId:x.questionId,choice:x.choice,at:x.at}}),reviews:Object.fromEntries(Object.entries(v.reviews).map(([id,r])=>{const x=r as Review;return[id,{at:x.at,due:x.due,days:x.days,rating:x.rating}]}))};
}
export function mergeStudy(a:Study,b:Study):Study{
 const recent=<T extends {at:number}>(x:Record<string,T>,y:Record<string,T>)=>{const result={...x};for(const [k,v] of Object.entries(y))if(!result[k]||v.at>result[k].at)result[k]=v;return result;};
 const attempts=new Map(a.answers.map(x=>[x.id,x]));for(const x of b.answers)if(!attempts.has(x.id))attempts.set(x.id,x);
 return {...a,lessons:recent(a.lessons,b.lessons),reviews:recent(a.reviews,b.reviews),answers:[...attempts.values()].sort((x,y)=>x.at-y.at||x.id.localeCompare(y.id))};
}
const DB='pcb-workbench-v1';let opening:Promise<IDBDatabase>|undefined;
export function database(){return opening??=new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('study');r.onerror=()=>{opening=undefined;reject(r.error)};r.onblocked=()=>{opening=undefined;reject(Error('请关闭旧标签页后重试。'))};r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();opening=undefined};resolve(r.result)}});}
export async function readStudy():Promise<Study>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('study','readonly');const r=tx.objectStore('study').get('current');let value:Study;r.onsuccess=()=>{value=r.result||emptyStudy()};tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
export async function updateStudy(change:(s:Study)=>Study,backup=false):Promise<Study>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('study','readwrite');const store=tx.objectStore('study');const r=store.get('current');let next:Study;let error:unknown;r.onsuccess=()=>{try{const prior=r.result||emptyStudy();next=change(structuredClone(prior));if(backup)store.put(prior,'beforeImport');store.put(next,'current')}catch(e){error=e;tx.abort()}};tx.oncomplete=()=>resolve(next);tx.onerror=()=>reject(error||tx.error);tx.onabort=()=>reject(error||tx.error);});}
export async function readBackup():Promise<Study|undefined>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('study');const r=tx.objectStore('study').get('beforeImport');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});}
