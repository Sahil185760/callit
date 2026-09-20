import {env} from 'cloudflare:workers';
import {emptyGame,type Game} from './game';
function db(){if(!env.DB)throw new Error('Cloud storage is unavailable. Please retry shortly.');return env.DB;}
export async function read(){
 await db().prepare('INSERT OR IGNORE INTO game (id,revision,data) VALUES (1,0,?)').bind(JSON.stringify(emptyGame())).run();
 const row=await db().prepare('SELECT revision,data FROM game WHERE id=1').first<{revision:number;data:string}>();
 if(!row)throw new Error('Cloud storage is unavailable.');return {revision:row.revision,state:JSON.parse(row.data) as Game};
}
// Revision-checked writes commit balances, trades, votes and settlement atomically.
export async function mutate(fn:(s:Game)=>void){for(let i=0;i<6;i++){const {revision,state}=await read();fn(state);const r=await db().prepare('UPDATE game SET data=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(state),revision).run();if(r.meta.changes)return state;}throw new Error('The league is busy. Please try again.');}
