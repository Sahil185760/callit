import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyGame, probability, buy, settle, deleteLeague, quote } from '../lib/game.ts';
function fixture() {
 const s=emptyGame(); s.people=[{id:'a',name:'A',balance:10000},{id:'b',name:'B',balance:10000}];
 s.leagues=[{id:'l',name:'League',code:'TEST',owner:'a',members:['a','b']}];
 const m={id:'m',league:'l',creator:'a',title:'Test',rules:'Test',closes:'2099-01-01T00:00:00Z',source:'custom',probability:0.5,opening:0.5,volume:0,status:'open',votes:[],history:[],updated:''};
 s.markets.push(m); return {s,m};
}
test('moneylines convert to probabilities and reject invalid values',()=>{
 assert.equal(probability(-150),0.6); assert.equal(probability(150),0.4); assert.throws(()=>probability(0));
});
test('winners receive the actual pool and total coins are conserved',()=>{
 const {s,m}=fixture(); buy(s,m,'a','yes',300,'1'); buy(s,m,'b','no',100,'2');
 assert.equal(quote(m,'yes',60,s).payout,60*460/360);
 settle(s,m,'yes'); assert.equal(s.people[0].balance,10100); assert.equal(s.people[1].balance,9900);
 assert.equal(s.people.reduce((n,p)=>n+p.balance,0),20000); assert.throws(()=>settle(s,m,'yes'));
});
test('void or empty winning pool refunds all stakes',()=>{
 for(const outcome of ['void','no']){const {s,m}=fixture();buy(s,m,'a','yes',300,'1');settle(s,m,outcome);assert.equal(s.people[0].balance,10000);assert.equal(m.status,'void');}
});
test('duplicate trade identifiers do not debit twice',()=>{
 const {s,m}=fixture();buy(s,m,'a','yes',100,'same');buy(s,m,'a','yes',100,'same');assert.equal(s.people[0].balance,9900);assert.equal(s.trades.length,1);
});
test('only commissioner can delete a league; unsettled stakes are refunded',()=>{
 const {s,m}=fixture();buy(s,m,'b','no',200,'1');assert.throws(()=>deleteLeague(s,'l','b'));deleteLeague(s,'l','a');assert.equal(s.people[1].balance,10000);assert.equal(s.leagues.length,0);assert.equal(s.markets.length,0);assert.equal(s.trades.length,0);
});
