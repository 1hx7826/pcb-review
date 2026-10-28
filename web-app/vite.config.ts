import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({plugins:[react()],base:'./',server:{host:'127.0.0.1',port:5186,strictPort:true,fs:{strict:true,allow:[fileURLToPath(new URL('..',import.meta.url))],deny:['**/docs/**','**/scripts/**','**/.env*','**/*.pdf','**/*.pptx','**/*.epro']}},build:{target:'es2022',sourcemap:false}});
