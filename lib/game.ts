export type Person = {id:string; name:string; balance:number};
export type League = {id:string; name:string; code:string; owner:string; members:string[]};
export type Trade = {id:string; user:string; market:string; side:'yes'|'no'; cost:number; shares:number; time:string; payout?:number};
export type Market = {id:string; league:string; creator:string; title:string; rules:string; closes:string; source:string; probability:number; opening:number; volume:number; status:'open'|'yes'|'no'|'void'; votes:{user:string;reason:string}[]; history:{time:string;p:number}[]; updated:string};
export type Game = {people:Person[]; leagues:League[]; markets:Market[]; trades:Trade[]};
export const emptyGame = ():Game => ({people:[],leagues:[],markets:[],trades:[]});
export function probability(line:number) {if(!Number.isFinite(line)||Math.abs(line)<100||Math.abs(line)>10000)throw new Error('Use a moneyline between −10000 and −100, or +100 and +10000.');return line<0?-line/(-line+100):100/(line+100);}
export function moneyline(p:number){p=Math.min(.999,Math.max(.001,p));return p>=.5?`${Math.round(-100*p/(1-p))}`:`+${Math.round(100*(1-p)/p)}`;}
export function pools(s:Pick<Game,'trades'>,m:Market){const trades=s.trades.filter(t=>t.market===m.id);return {yes:trades.filter(t=>t.side==='yes').reduce((n,t)=>n+t.cost,0),no:trades.filter(t=>t.side==='no').reduce((n,t)=>n+t.cost,0)};}
export function marketView(s:Pick<Game,'trades'>,m:Market){if(m.source!=='custom'||m.status!=='open')return m;const pool=pools(s,m);const total=pool.yes+pool.no;return {...m,probability:total?pool.yes/total:m.opening,volume:total};}
export function positionValue(m:Market,t:Trade){return t.payout??t.cost;}
export function quote(m:Market,side:'yes'|'no',cost:number,s:Pick<Game,'trades'>={trades:[]}){
 const pool=pools(s,m);const total=pool.yes+pool.no+cost;const winning=pool[side]+cost;
 return {shares:cost,p:(pool.yes+(side==='yes'?cost:0))/total,payout:cost*total/winning};
}
export function settle(s:Game,m:Market,outcome:'yes'|'no'|'void'){
 if(m.status!=='open')throw new Error('This market is already settled.');
 const trades=s.trades.filter(t=>t.market===m.id);const pool=pools(s,m);const total=pool.yes+pool.no;const winning=outcome==='void'?0:pool[outcome];
 // Empty winning pools refund every stake. Otherwise all custom payouts come from the actual pot.
 const refund=outcome==='void'||winning===0;
 m.status=refund?'void':outcome;for(const t of trades){t.payout=refund?t.cost:t.side!==outcome?0:t.cost/winning*total;const u=s.people.find(u=>u.id===t.user)!;u.balance+=t.payout;}
}
export function buy(s:Game,m:Market,user:string,side:'yes'|'no',cost:number,id:string){
 const prior=s.trades.find(t=>t.id===id);if(prior){if(prior.user!==user)throw new Error('Invalid trade ID.');return;}
 if(m.status!=='open'||Date.parse(m.closes)<=Date.now())throw new Error('Trading has closed.');
 if(!['yes','no'].includes(side)||!Number.isFinite(cost)||cost<1||cost>2000)throw new Error('Trade 1–2,000 coins at a time.');
 const u=s.people.find(u=>u.id===user)!;if(u.balance+1e-9<cost)throw new Error('Not enough coins.');
 const q=quote(m,side,cost,s);
 u.balance-=cost;m.probability=q.p;m.volume+=cost;m.updated=new Date().toISOString();m.history.push({time:m.updated,p:q.p});m.history=m.history.slice(-300);
 s.trades.push({id,user,market:m.id,side,cost,shares:q.shares,time:m.updated});
}
export function deleteLeague(s:Game,leagueId:string,userId:string){
 const league=s.leagues.find(l=>l.id===leagueId);
 if(!league)throw new Error('League not found.');
 if(league.owner!==userId)throw new Error('Only the commissioner can delete this league.');
 const markets=s.markets.filter(m=>m.league===leagueId);
 for(const market of markets)if(market.status==='open')settle(s,market,'void');
 const removedIds=new Set(markets.map(m=>m.id));
 s.trades=s.trades.filter(t=>!removedIds.has(t.market));
 s.markets=s.markets.filter(m=>m.league!==leagueId);
 s.leagues=s.leagues.filter(l=>l.id!==leagueId);
}

// Retire imported predictions without stranding anyone's play-money stakes.
// Closed records remain available in betting history; refunds run only once.
export function retireImportedMarkets(s:Game){for(const m of s.markets)if(m.source!=='custom'&&m.status==='open')settle(s,m,'void');}
