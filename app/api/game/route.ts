import {getChatGPTUser} from '@/app/chatgpt-auth';
import {read,mutate} from '@/lib/store';
import {buy,probability,settle,marketView,deleteLeague,retireImportedMarkets,type Game} from '@/lib/game';
export const dynamic='force-dynamic';
function view(s:Game,id:string){const leagues=s.leagues.filter(l=>l.members.includes(id));const ids=new Set(leagues.map(l=>l.id));const markets=s.markets.filter(m=>ids.has(m.league)).map(m=>marketView(s,m));const mids=new Set(markets.map(m=>m.id));return {me:s.people.find(p=>p.id===id),leagues,markets,trades:s.trades.filter(t=>mids.has(t.market)),people:s.people.filter(p=>p.id===id||leagues.some(l=>l.members.includes(p.id)))};}
function text(v:unknown,max=200){if(typeof v!=='string'||!v.trim()||v.length>max)throw new Error('Please complete all fields with valid text.');return v.trim();}
export async function GET(){try{const u=await getChatGPTUser();if(!u)return Response.json({error:'Sign in to use your coin account.'},{status:401});const {state}=await read();const current=state.markets.some(m=>m.source!=='custom'&&m.status==='open')?await mutate(retireImportedMarkets):state;return Response.json(view(current,u.userId),{headers:{'Cache-Control':'no-store'}});}catch(e){console.error(e);return Response.json({error:'Could not load live data. Please retry.'},{status:503});}}
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'Invalid origin.'},{status:403});
 const u=await getChatGPTUser();if(!u)return Response.json({error:'Sign in first.'},{status:401});
 const raw=await req.text();if(raw.length>12000)throw new Error('Request too large.');const a=JSON.parse(raw);
 const result=await mutate(s=>{
 retireImportedMarkets(s);
 const person=s.people.find(p=>p.id===u.userId);
 if(a.action==='register'){if(!person)s.people.push({id:u.userId,name:text(a.name,30),balance:10000});return;}
 if(!person)throw new Error('Choose your player name first.');
 if(a.action==='createLeague'){const name=text(a.name,60);s.leagues.push({id:crypto.randomUUID(),name,code:crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase(),owner:u.userId,members:[u.userId]});return;}
 if(a.action==='joinLeague'){const l=s.leagues.find(l=>l.code===text(a.code,20).toUpperCase());if(!l)throw new Error('Invite code not found.');if(!l.members.includes(u.userId))l.members.push(u.userId);return;}
 const existing=s.markets.find(m=>m.id===a.market);const l=s.leagues.find(l=>l.id===(existing?.league??a.league));if(!l||!l.members.includes(u.userId))throw new Error('Join this league first.');
 if(a.action==='deleteLeague'){deleteLeague(s,l.id,u.userId);return;}
 if(a.action==='createMarket'){
 const now=new Date().toISOString();const close=text(a.closes);if(!Number.isFinite(Date.parse(close))||Date.parse(close)<=Date.now())throw new Error('Choose a future closing time.');
 const p=probability(Number(a.line));
 s.markets.push({id:crypto.randomUUID(),league:l.id,creator:u.userId,title:text(a.title,180),rules:text(a.rules,2000),closes:close,source:'custom',probability:p,opening:p,volume:0,status:'open',votes:[],history:[{time:now,p}],updated:now});return;}
 if(!existing)throw new Error('Market not found.');const m=existing;
 if(a.action==='trade'){
 if(m.source==='custom'&&a.poolVersion!==1)throw new Error('Refresh the page to review the betting rules before placing a bet.');
 buy(s,m,u.userId,a.side,Number(a.cost),text(a.tradeId,80));return;}
 if(a.action==='veto'){if(m.status!=='open')throw new Error('Settled markets cannot be vetoed.');if(m.votes.some(v=>v.user===u.userId))throw new Error('You have already voted.');m.votes.push({user:u.userId,reason:text(a.reason,300)});if(m.votes.length>=Math.ceil(l.members.length*2/3))settle(s,m,'void');return;}
 if(a.action==='settle'){if(l.owner!==u.userId)throw new Error('Only the commissioner can settle.');if(Date.parse(m.closes)>Date.now())throw new Error('Wait until trading closes.');if(!['yes','no','void'].includes(a.outcome))throw new Error('Choose a valid outcome.');settle(s,m,a.outcome);return;}
 throw new Error('Unknown action.');
 });return Response.json(view(result,u.userId),{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error(e);return Response.json({error:e instanceof Error?e.message:'Could not save. Try again.'},{status:400});}}
