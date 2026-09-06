(()=>{
const RX={
 'Bench Press':{reps:6,sets:3,inc:5},'Incline DB Press':{reps:8,sets:3,inc:5},'Bent Over Row':{reps:8,sets:3,inc:5},'Lat Pulldown':{reps:8,sets:3,inc:5},'Face Pull':{reps:15,sets:3,inc:5},'Barbell Curl':{reps:8,sets:3,inc:5},'Triceps Pushdown':{reps:12,sets:3,inc:5},
 'Back Squat':{reps:8,sets:3,inc:5},'Leg Press':{reps:10,sets:3,inc:10},'Romanian Deadlift':{reps:6,sets:3,inc:10},'Leg Curl':{reps:12,sets:3,inc:10},'Standing Calf Raise':{reps:15,sets:3,inc:10},
 'Pull Up':{reps:8,sets:3,inc:5},'Chest Supported Row':{reps:10,sets:3,inc:5},'Overhead Press':{reps:8,sets:3,inc:5},'Machine Chest Press':{reps:8,sets:3,inc:5},'Hammer Curl':{reps:12,sets:3,inc:5},'Cable Extension':{reps:12,sets:3,inc:5}
};
const originalTargetLoad=window.targetLoad;
const originalRenderWorkout=window.renderWorkout;
const originalFinishWorkout=window.finishWorkout;
const originalFinishApexExercise=window.finishApexExercise;
let applying=false;
function rx(name){return RX[name]||{reps:10,sets:3,inc:5};}
function allMeta(){return DAYS.flatMap(d=>d.groups.flatMap(g=>g[2]));}
function lastSession(name){const h=hist(name);return h.length?h[h.length-1]:null;}
function completedTarget(name,session){const p=rx(name);return !!(session&&Array.isArray(session.sets)&&session.sets.length>=p.sets&&session.sets.slice(0,p.sets).every(s=>Number(s.reps)>=p.reps));}
function baseLoad(name){const l=lastSession(name);if(l)return Number(l.weight)||0;if(name==='Pull Up')return 0;return Number(originalTargetLoad?.(name))||0;}
window.targetLoad=function(name){const p=rx(name),l=lastSession(name);if(!l)return baseLoad(name);return completedTarget(name,l)?(Number(l.weight)||0)+p.inc:(Number(l.weight)||0);};
function applyPrescriptionToData(){allMeta().forEach(e=>{const p=rx(e[0]);e[2]=p.sets;e[3]=String(p.reps);});}
function ensureStyles(){if(document.getElementById('liftLogLogicStyles'))return;const s=document.createElement('style');s.id='liftLogLogicStyles';s.textContent=`
.liftLogRule{margin:0 12px 8px;padding:9px 11px;border-radius:10px;background:#0d1114;border:1px solid #293038;color:#aeb6bd;font-size:10px;line-height:1.45}.liftLogRule b{color:var(--accent2)}
.setrow .reps.hit{border-color:#4f8b62;box-shadow:0 0 0 1px rgba(79,139,98,.2) inset}.setrow .reps.miss{border-color:#6d4b3c}.programRule{font-size:9px!important;color:var(--accent2)!important;margin-top:4px!important}.homeRule{display:block;color:#aeb6bd;font-weight:500;margin-top:2px}.progressionReady{color:#8fc79e!important}
`;document.head.appendChild(s);}
function liftName(lift){return (lift.dataset.name||lift.querySelector('h4')?.textContent||'').trim();}
function decorateLiftTargets(){document.querySelectorAll('#workoutList .lift').forEach(lift=>{const name=liftName(lift),p=rx(name);if(!name)return;lift.dataset.min=String(p.reps);lift.dataset.targetReps=String(p.reps);lift.dataset.targetSets=String(p.sets);const load=Number(window.targetLoad(name))||0;
 lift.querySelectorAll('.setrow').forEach((row,i)=>{const rep=row.querySelector('.reps');if(!rep)return;rep.placeholder=`Target ${p.reps}`;rep.setAttribute('aria-label',`Set ${i+1} reps, target ${p.reps}`);const paint=()=>{const v=rep.value===''?null:Number(rep.value);rep.classList.toggle('hit',v!==null&&v>=p.reps);rep.classList.toggle('miss',v!==null&&v<p.reps);};rep.oninput=paint;paint();});
 if(name==='Pull Up'){lift.querySelectorAll('.weight').forEach(input=>{input.value=String(load);input.placeholder='Added lb';});const strong=lift.querySelector('.liftPrescription strong'),label=load>0?`Bodyweight + ${load} lb`:'Bodyweight';if(strong&&strong.textContent!==label)strong.textContent=label;}
 let rule=lift.querySelector('.liftLogRule');if(!rule){rule=document.createElement('div');rule.className='liftLogRule';(lift.querySelector('.liftPrescription')||lift.querySelector('.liftTop'))?.insertAdjacentElement('afterend',rule);}const prev=lastSession(name),ready=completedTarget(name,prev),loadLabel=name==='Pull Up'?(load>0?`Bodyweight + ${load} lb`:'Bodyweight'):`${load} lb`;const desired=`<b>${p.sets} × ${p.reps}</b> at ${loadLabel}. Hit ${p.reps}+ on every set → add ${p.inc} lb next time. ${prev?(ready?'Target hit last time — load increased.':'Miss one set — keep the same load.'):'First logged session sets your baseline.'}`;if(rule.innerHTML!==desired)rule.innerHTML=desired;
});}
function refreshProgramRules(){document.querySelectorAll('#programList .exercise').forEach(card=>{const name=(card.querySelector('h4')?.textContent||'').trim();if(!name)return;const p=rx(name);let line=card.querySelector('.programRule');if(!line){line=document.createElement('p');line.className='programRule';card.querySelector('.exerciseMain div:nth-child(2)')?.appendChild(line);}const desired=`Target ${p.sets} × ${p.reps} · +${p.inc} lb only when every set hits ${p.reps}`;if(line&&line.textContent!==desired)line.textContent=desired;line?.classList.toggle('progressionReady',completedTarget(name,lastSession(name)));});}
function refreshHomeRules(){document.querySelectorAll('#apexHomeFlow .homeExercise').forEach(card=>{const name=(card.querySelector('h4')?.textContent||'').trim();if(!name)return;const p=rx(name),load=Number(window.targetLoad(name))||0,line=card.querySelector('.homeLoad');if(!line)return;const label=name==='Pull Up'?(load>0?`Bodyweight + ${load} lb`:'Bodyweight'):`${load} lb`,desired=`${label} · ${p.sets} × ${p.reps}<span class="homeRule">+${p.inc} lb when all ${p.sets} sets hit ${p.reps}</span>`;if(line.innerHTML!==desired)line.innerHTML=desired;});}
function rerenderStatic(){renderProgram();document.getElementById('apexHomeFlow')?.remove();requestAnimationFrame(()=>{refreshProgramRules();refreshHomeRules();});}
window.renderWorkout=function(){originalRenderWorkout();requestAnimationFrame(decorateLiftTargets);};
function validateLift(lift){const name=liftName(lift),p=rx(name),rows=[...lift.querySelectorAll('.setrow')],touched=rows.some(r=>r.querySelector('.check')?.classList.contains('done')||r.querySelector('.reps')?.value!=='');if(!touched)return {skip:true,name};if(rows.length!==p.sets)return {error:`${name}: expected ${p.sets} sets`};for(let i=0;i<rows.length;i++){const row=rows[i],rep=row.querySelector('.reps');if(!row.querySelector('.check')?.classList.contains('done'))return {error:`${name}: complete all ${p.sets} sets`};if(!rep||rep.value==='')return {error:`${name}: enter reps for all ${p.sets} sets`};}return {name,p};}
function visibleSingleLift(){return [...document.querySelectorAll('#workoutList .lift')].find(l=>getComputedStyle(l).display!=='none');}
window.finishApexExercise=function(){const lift=visibleSingleLift();if(!lift){toast('No exercise selected');return;}const v=validateLift(lift);if(v.error){toast(v.error);return;}if(v.skip){toast('Complete the exercise first');return;}originalFinishApexExercise();setTimeout(rerenderStatic,0);};
window.finishWorkout=function(){const lifts=[...document.querySelectorAll('#workoutList .lift')];let completed=0;for(const lift of lifts){const v=validateLift(lift);if(v.error){toast(v.error);return;}if(!v.skip)completed++;}if(!completed){toast('Complete at least one exercise first');return;}originalFinishWorkout();setTimeout(rerenderStatic,0);};
function scheduleDecorate(){if(applying)return;applying=true;requestAnimationFrame(()=>{applying=false;decorateLiftTargets();refreshProgramRules();refreshHomeRules();});}
function init(){applyPrescriptionToData();ensureStyles();rerenderStatic();const observer=new MutationObserver(scheduleDecorate);observer.observe(document.body,{childList:true,subtree:true});scheduleDecorate();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();