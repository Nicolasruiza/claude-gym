(()=>{
const RX={
 'Bench Press':{reps:6,sets:3,inc:5},
 'Incline DB Press':{reps:8,sets:3,inc:5},
 'Bent Over Row':{reps:8,sets:3,inc:5},
 'Lat Pulldown':{reps:8,sets:3,inc:5},
 'Face Pull':{reps:15,sets:3,inc:5},
 'Barbell Curl':{reps:8,sets:3,inc:5},
 'Triceps Pushdown':{reps:12,sets:3,inc:5},
 'Back Squat':{reps:8,sets:3,inc:5},
 'Leg Press':{reps:10,sets:3,inc:10},
 'Romanian Deadlift':{reps:6,sets:3,inc:10},
 'Leg Curl':{reps:12,sets:3,inc:10},
 'Standing Calf Raise':{reps:15,sets:3,inc:10},
 'Pull Up':{reps:8,sets:3,inc:5},
 'Chest Supported Row':{reps:10,sets:3,inc:5},
 'Overhead Press':{reps:8,sets:3,inc:5},
 'Machine Chest Press':{reps:8,sets:3,inc:5},
 'Hammer Curl':{reps:12,sets:3,inc:5},
 'Cable Extension':{reps:12,sets:3,inc:5}
};
const originalTargetLoad=window.targetLoad;
const originalRenderWorkout=window.renderWorkout;
let applying=false;

function rx(name){return RX[name]||{reps:10,sets:3,inc:5};}
function allMeta(){return DAYS.flatMap(d=>d.groups.flatMap(g=>g[2]));}
function exerciseMeta(name){return allMeta().find(e=>e[0]===name);}
function lastSession(name){const h=hist(name);return h.length?h[h.length-1]:null;}
function completedTarget(name,session){
 const p=rx(name);if(!session||!Array.isArray(session.sets)||session.sets.length<p.sets)return false;
 return session.sets.slice(0,p.sets).every(s=>Number(s.reps)>=p.reps);
}
function baseLoad(name){
 const l=lastSession(name);if(l)return Number(l.weight)||0;
 const fallback=Number(originalTargetLoad?.(name))||0;
 if(name==='Pull Up')return 0;
 return fallback;
}
window.targetLoad=function(name){
 const p=rx(name),l=lastSession(name);if(!l)return baseLoad(name);
 return completedTarget(name,l)?(Number(l.weight)||0)+p.inc:(Number(l.weight)||0);
};

function applyPrescriptionToData(){
 allMeta().forEach(e=>{const p=rx(e[0]);e[2]=p.sets;e[3]=String(p.reps);});
}
function ensureStyles(){
 if(document.getElementById('liftLogLogicStyles'))return;
 const s=document.createElement('style');s.id='liftLogLogicStyles';s.textContent=`
 .liftLogRule{margin:0 12px 8px;padding:9px 11px;border-radius:10px;background:#0d1114;border:1px solid #293038;color:#aeb6bd;font-size:10px;line-height:1.45}.liftLogRule b{color:var(--accent2)}
 .setrow .reps.hit{border-color:#4f8b62;box-shadow:0 0 0 1px rgba(79,139,98,.2) inset}.setrow .reps.miss{border-color:#6d4b3c}.setTarget{font-size:8px;color:var(--muted);text-align:center;margin-top:2px}
 .programRule{font-size:9px!important;color:var(--accent2)!important;margin-top:4px!important}.homeRule{display:block;color:#aeb6bd;font-weight:500;margin-top:2px}.progressionReady{color:#8fc79e!important}
 `;document.head.appendChild(s);
}
function liftName(lift){return (lift.dataset.name||lift.querySelector('h4')?.textContent||'').trim();}
function decorateLiftTargets(){
 document.querySelectorAll('#workoutList .lift').forEach(lift=>{
  const name=liftName(lift),p=rx(name);if(!name)return;
  lift.dataset.min=String(p.reps);lift.dataset.targetReps=String(p.reps);lift.dataset.targetSets=String(p.sets);
  const rows=[...lift.querySelectorAll('.setrow')];
  rows.forEach((row,i)=>{
   const rep=row.querySelector('.reps');if(!rep)return;
   rep.placeholder=`Target ${p.reps}`;rep.setAttribute('aria-label',`Set ${i+1} reps, target ${p.reps}`);
   if(!row.querySelector('.setTarget')){const t=document.createElement('div');t.className='setTarget';t.textContent=`goal ${p.reps}`;rep.insertAdjacentElement('afterend',t);}
   const paint=()=>{const v=rep.value===''?null:Number(rep.value);rep.classList.toggle('hit',v!==null&&v>=p.reps);rep.classList.toggle('miss',v!==null&&v<p.reps);};
   rep.oninput=paint;paint();
  });
  let rule=lift.querySelector('.liftLogRule');if(!rule){rule=document.createElement('div');rule.className='liftLogRule';const anchor=lift.querySelector('.liftPrescription')||lift.querySelector('.liftTop');anchor?.insertAdjacentElement('afterend',rule);}
  const current=Number(window.targetLoad(name))||0,prev=lastSession(name),ready=completedTarget(name,prev);
  const loadLabel=name==='Pull Up'?(current>0?`Bodyweight + ${current} lb`:'Bodyweight'):`${current} lb`;
  rule.innerHTML=`<b>${p.sets} × ${p.reps}</b> at ${loadLabel}. Hit ${p.reps}+ on every set → ${p.inc?`add ${p.inc} lb next time`:'hold load'}. ${prev?(ready?'Target hit last time — load increased.':'Miss one set — keep the same load.'):'First logged session sets your baseline.'}`;
 });
}
function refreshProgramRules(){
 document.querySelectorAll('#programList .exercise').forEach(card=>{
  const name=(card.querySelector('h4')?.textContent||'').trim();if(!name)return;const p=rx(name);let line=card.querySelector('.programRule');
  if(!line){line=document.createElement('p');line.className='programRule';card.querySelector('.exerciseMain div:nth-child(2)')?.appendChild(line);}
  const l=lastSession(name);line.textContent=`Target ${p.sets} × ${p.reps} · +${p.inc} lb only when every set hits ${p.reps}`;line.classList.toggle('progressionReady',completedTarget(name,l));
 });
}
function refreshHomeRules(){
 document.querySelectorAll('#apexHomeFlow .homeExercise').forEach(card=>{
  const name=(card.querySelector('h4')?.textContent||'').trim();if(!name)return;const p=rx(name),load=Number(window.targetLoad(name))||0;
  const loadLine=card.querySelector('.homeLoad');if(loadLine){const label=name==='Pull Up'?(load>0?`Bodyweight + ${load} lb`:'Bodyweight'):`${load} lb`;loadLine.innerHTML=`${label} · ${p.sets} × ${p.reps}<span class="homeRule">+${p.inc} lb when all ${p.sets} sets hit ${p.reps}</span>`;}
 });
}
function rerenderStatic(){
 renderProgram();const mount=document.getElementById('apexHomeFlow');if(mount)mount.remove();
 requestAnimationFrame(()=>{refreshProgramRules();refreshHomeRules();});
}
window.renderWorkout=function(){originalRenderWorkout();requestAnimationFrame(()=>{decorateLiftTargets();});};

function readCompletedLift(lift){
 const name=liftName(lift),p=rx(name),rows=[...lift.querySelectorAll('.setrow')];
 const touched=rows.some(r=>r.querySelector('.check')?.classList.contains('done')||r.querySelector('.reps')?.value!=='');
 if(!touched)return {skip:true,name};
 if(rows.length!==p.sets)return {error:`${name}: expected ${p.sets} sets`};
 const reps=[];let weight=0;
 for(let i=0;i<rows.length;i++){
  const row=rows[i],check=row.querySelector('.check'),rep=row.querySelector('.reps'),w=row.querySelector('.weight');
  if(!check?.classList.contains('done'))return {error:`${name}: complete all ${p.sets} sets`};
  if(!rep||rep.value==='')return {error:`${name}: enter reps for all ${p.sets} sets`};
  reps.push(Number(rep.value));if(i===0)weight=Number(w?.value)||0;
 }
 return {name,p,weight,reps,hit:reps.every(v=>v>=p.reps)};
}
function saveLift(result){
 hist(result.name).push({date:new Date().toLocaleDateString('en-CA'),weight:result.weight,sets:result.reps.map(reps=>({reps,minRep:result.p.reps})),minRep:result.p.reps});
}
function visibleSingleLift(){return [...document.querySelectorAll('#workoutList .lift')].find(l=>getComputedStyle(l).display!=='none');}
window.finishApexExercise=function(){
 const lift=visibleSingleLift();if(!lift){toast('No exercise selected');return;}const r=readCompletedLift(lift);if(r.error){toast(r.error);return;}if(r.skip){toast('Complete the exercise first');return;}
 saveLift(r);save();clearInterval(timerInt);const next=r.hit?r.weight+r.p.inc:r.weight;updateHome();show('home');document.querySelectorAll('.bottom .nav').forEach(b=>b.classList.toggle('active',(b.querySelector('.navLabel')?.textContent||'').trim()==='Home'));
 toast(r.hit?`${r.name} saved · next ${r.name==='Pull Up'?`+${next} lb`:next+' lb'}`:`${r.name} saved · hold ${r.name==='Pull Up'?(r.weight?`+${r.weight} lb`:'bodyweight'):r.weight+' lb'}`);rerenderStatic();
};
window.finishWorkout=function(){
 const lifts=[...document.querySelectorAll('#workoutList .lift')],results=[];
 for(const lift of lifts){const r=readCompletedLift(lift);if(r.error){toast(r.error);return;}if(!r.skip)results.push(r);}
 if(!results.length){toast('Complete at least one exercise first');return;}
 results.forEach(saveLift);save();localStorage.apexSessions=Number(localStorage.apexSessions||0)+1;activeDay=(activeDay+1)%3;localStorage.apexDay=activeDay;clearInterval(timerInt);updateHome();show('home');
 const ups=results.filter(r=>r.hit&&r.p.inc).length;toast(`Workout saved${ups?` · ${ups} load increase${ups>1?'s':''} unlocked`:''}`);rerenderStatic();
};
function scheduleDecorate(){if(applying)return;applying=true;requestAnimationFrame(()=>{applying=false;decorateLiftTargets();refreshProgramRules();refreshHomeRules();});}
function init(){
 applyPrescriptionToData();ensureStyles();rerenderStatic();
 const observer=new MutationObserver(scheduleDecorate);observer.observe(document.body,{childList:true,subtree:true});scheduleDecorate();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();