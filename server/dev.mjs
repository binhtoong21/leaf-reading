import { spawn } from 'node:child_process';
import './index.mjs';
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js','--host','127.0.0.1'], {stdio:'inherit'});
process.on('SIGINT',()=>{vite.kill();process.exit()});
process.on('SIGTERM',()=>{vite.kill();process.exit()});
vite.on('exit',code=>process.exit(code??0));
