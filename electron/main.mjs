import {app,BrowserWindow,dialog,shell} from 'electron';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {startServer} from '../server/index.mjs';

const icon=fileURLToPath(new URL('../build/icon.png',import.meta.url));
const external=url=>{if(/^https?:\/\//i.test(url))shell.openExternal(url)};
let win=null,api=null;

if(!app.requestSingleInstanceLock())app.quit();
else{
  app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus()}});
  app.whenReady().then(async()=>{
    const userData=app.getPath('userData');
    try{api=await startServer({dataDir:userData,envFile:join(userData,'.env')})}
    catch(e){
      dialog.showErrorBox('Không mở được Leaf',e?.code==='EADDRINUSE'
        ?'Cổng 4318 đang được dùng. Có thể bản web của Leaf (npm start hoặc npm run dev) đang chạy. Hãy tắt nó rồi mở lại app.'
        :String(e?.message||e));
      app.quit();return;
    }
    win=new BrowserWindow({width:1320,height:860,minWidth:900,minHeight:600,show:false,backgroundColor:'#fbfcfa',title:'Leaf',icon,autoHideMenuBar:true,
      webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});
    win.removeMenu();
    win.once('ready-to-show',()=>win.show());
    win.webContents.setWindowOpenHandler(({url})=>{external(url);return{action:'deny'}});
    win.webContents.on('will-navigate',(e,url)=>{if(url!==api.url&&!url.startsWith(api.url+'/')){e.preventDefault();external(url)}});
    win.on('closed',()=>{win=null});
    await win.loadURL(api.url);
  });
  app.on('window-all-closed',()=>app.quit());
  app.on('will-quit',()=>{api?.close()});
}
