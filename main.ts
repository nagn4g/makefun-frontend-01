import {cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {buildDossier} from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const firstLoad = ['index.html','style.css','main.js','api.js','views.js','format.js'];
export function measureFirstLoad() {
  return firstLoad.reduce((bytes,file) => bytes + gzipSync(readFileSync(join(root,'app',file)),{level:9}).length,0);
}
export function assembleDossier(output: string) {
  const destination = resolve(output);
  if (destination === resolve(root) || resolve(root).startsWith(destination + '/') || ['app','screenshots','vendor'].some(name => destination === resolve(root,name) || destination.startsWith(resolve(root,name) + '/'))) throw new Error('Output must not replace source directories');
  mkdirSync(destination,{recursive:true});
  // Prevent an earlier successful dossier from surviving a failed rebuild.
  rmSync(join(destination,'dossier.json'),{force:true});
  for (const directory of ['app','screenshots']) {
    const target = join(destination,directory);
    rmSync(target,{recursive:true,force:true});
    if (existsSync(join(root,directory))) cpSync(join(root,directory),target,{recursive:true});
    else mkdirSync(target,{recursive:true});
  }
  const dossier = buildDossier(destination,{text_max_bytes:163840,screenshots:{max:3,max_bytes:262144},app_max_files:993,app_max_bytes:16777216});
  writeFileSync(join(destination,'dossier.json'),dossier);
  console.log(`Dossier assembled in ${destination}; first load ${measureFirstLoad()} gzip-9 bytes.`);
}
if (process.argv.includes('--serve')) await import('./serve.ts');
else assembleDossier(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
