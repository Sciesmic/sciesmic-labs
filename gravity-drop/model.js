// Gravity Drop 1.0.0. Pure deterministic SI model. No animation or measurement noise.
export const VERSION='1.0.0', G=9.8, RHO=1.225;
// Illustrative fixed orientations, not measured predictions for arbitrary real objects.
export const OBJECTS={
 feather:{mass:.001,area:.006,cd:1.2},
 bowling:{mass:7.0,area:.0366,cd:.47},
 basketball:{mass:.625,area:.0452,cd:.47},
 paper:{mass:.005,area:.0624,cd:1.2},
 crumpled:{mass:.005,area:.0013,cd:.8}
};
export function settings(p={}){const h=Number(p.height);return {height:Number.isFinite(h)?Math.max(0,Math.min(30,h)):10,a:OBJECTS[p.a]?p.a:'feather',b:OBJECTS[p.b]?p.b:'bowling',environment:p.environment==='vacuum'?'vacuum':'air'};}
const logcosh=x=>Math.abs(x)+Math.log1p(Math.exp(-2*Math.abs(x)))-Math.LN2;
export function flight(id,height,environment='air'){
 const o=OBJECTS[id];if(!o)throw new RangeError('Unknown object');
 height=settings({height}).height;const k=environment==='vacuum'?0:.5*RHO*o.cd*o.area;
 const terminal=k?Math.sqrt(o.mass*G/k):Infinity,z=k*height/o.mass;
 const duration=height===0?0:k?terminal/G*(z+Math.log1p(Math.sqrt(-Math.expm1(-2*z)))):Math.sqrt(2*height/G);
 function at(time){const t=Math.max(0,Math.min(duration,Number(time)||0));const impact=t>=duration;
  const speed=k?terminal*Math.tanh(G*t/terminal):G*t;
  const distance=impact?height:k?terminal**2/G*logcosh(G*t/terminal):.5*G*t*t;
  const drag=k*speed**2,weight=o.mass*G;
  return {time:t,height:Math.max(0,height-distance),distance,speed,weight,drag,net:weight-drag,acceleration:(weight-drag)/o.mass,impact};
 }
 return {id,...o,k,terminal,duration,at,impact:at(duration)};
}
export function simulate(input={}){const p=settings(input),objects=[flight(p.a,p.height,p.environment),flight(p.b,p.height,p.environment)];return {settings:p,objects,duration:Math.max(...objects.map(o=>o.duration)),winner:Math.abs(objects[0].duration-objects[1].duration)<1e-9?'tie':objects[0].duration<objects[1].duration?'a':'b'};}
export function challenge(seed=42){let x=Number(seed)>>>0;const next=()=>x=(Math.imul(x,1664525)+1013904223)>>>0;const ids=Object.keys(OBJECTS),a=ids[next()%ids.length];let b=ids[next()%ids.length];if(b===a)b=ids[(ids.indexOf(a)+1)%ids.length];return settings({a,b,height:[5,10,20,30][next()%4],environment:(next()>>>16)%2?'air':'vacuum'});}
