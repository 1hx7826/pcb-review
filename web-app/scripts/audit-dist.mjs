import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
const walk=async d=>(await Promise.all((await readdir(d,{withFileTypes:true})).map(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]))).flat();
const files=await walk('dist');
const privatePath=/[a-z]:[\\/]+(?:users|goal)[\\/]+/i;
const credential=/(?:ghp_|github_pat_)[a-z0-9_]{20,}/i;
for(const f of files){if(!/\.(html|js|css|svg)$/.test(f))throw Error(`Unexpected public file: ${f}`);const text=await readFile(f,'utf8');if(privatePath.test(text)||credential.test(text)||/\.epro["']\s*:\s*["']data:/.test(text))throw Error(`Private path or raw source in ${f}`)}
console.log(`Static audit passed: ${files.length} files, no raw source documents.`);
