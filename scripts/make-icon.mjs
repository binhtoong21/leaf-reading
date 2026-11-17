import {readFileSync,writeFileSync} from 'node:fs';
import {Resvg} from '@resvg/resvg-js';
const svg=readFileSync(new URL('../build/icon.svg',import.meta.url));
writeFileSync(new URL('../build/icon.png',import.meta.url),new Resvg(svg,{fitTo:{mode:'width',value:512}}).render().asPng());
console.log('build/icon.png written');
