(()=>{
const yt=name=>'https://www.youtube.com/results?search_query='+encodeURIComponent('proper form '+name);
const youtubeIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.2V8.8l5.5 3.2L10 15.2Z"/></svg>';
const BAR_WEIGHTS={'Bench Press':45,'Back Squat':45,'Bent Over Row':45,'Romanian Deadlift':45,'Overhead Press':45,'Barbell Curl':25};
const PLATES=[45,35,25,10,5,2.5,1.25];
let singleExercise=null;
let singleOrigin='home';
let scheduled=false;

function allExercises(){return DAYS.flatMap(d=>d.groups.flatMap(g=>g[2]));}
function meta(name){return allExercises().find(e=>e[0]===name);}
function recommendedLoad(name){
  if(name==='Pull Up')return 0;
  let load=Number(targetLoad(name))||0;
  const bar=BAR_WEIGHTS[name];
  if(bar&&load<bar)load=bar;
  return load;
}
function plateBreakdown(name,total){
  const bar=BAR_WEIGHTS[name];
  if(!bar)return'';
  if(total<=bar)return total===bar?`${bar} lb bar only`:`${bar} lb bar minimum`;
  let side=(total-bar)/2;
  const original=side;
  const out=[];
  PLATES.forEach(p=>{while(side>=p-.001){out.push(p);side=+(side-p).toFixed(2);}});
  const chips=out.length?out.map(p=>`<span class="plateChip">${p}</span>`).join(''):`<span class="plateChip">${original}</span>`;
  return `${bar} lb bar · each side ${original} lb <span class="plateChips">${chips}</span>`;
}
function exerciseImage(name){const e=meta(name);return e?img(e[4]):FALL;}
function topReps(session){return session?.sets?.length?Math.max(...session.sets.map(s=>Number(s.reps)||0)):0;}
function estimate1RM(session,name){if(!session||name==='Pull Up')return 0;return Math.round((Number(session.weight)||0)*(1+topReps(session)/30));}
function ensureStyles(){
  if(document.getElementById('apexFlowEnhancementStyles'))return;
  const s=document.createElement('style');
  s.id='apexFlowEnhancementStyles';
  s.textContent=`
  .bottom.apex-three-nav{grid-template-columns:repeat(3,1fr)!important}
  .homeFlow{margin-top:22px}.homeFlowHead{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:10px}.homeFlowHead h3{margin:0;font-size:16px}.homeFlowHead small{color:var(--muted);font-size:10px}
  .sessionChooser{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:10px 0 14px}.sessionChoice{min-height:44px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--muted);font-size:10px;font-weight:700}.sessionChoice.active{border-color:var(--accent);color:var(--accent2);background:var(--accentDim)}
  .homeExercise{width:100%;display:grid;grid-template-columns:68px 1fr auto;gap:11px;align-items:center;text-align:left;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:9px;margin-bottom:9px;color:var(--text)}.homeExercise:active{background:var(--panel2)}.homeExercise img{width:68px;height:58px;object-fit:cover;border-radius:10px;background:#1a1f24}.homeExercise h4{margin:0 0 4px;font-size:13px}.homeExercise p{margin:0;color:var(--muted);font-size:10px}.homeExercise .homeLoad{color:var(--accent2);font-weight:700;margin-top:4px}.homeExercise .go{color:var(--accent);font-size:22px;padding:0 5px}
  .workoutExercisePhoto{width:58px;height:54px;border-radius:10px;object-fit:cover;background:#1a1f24;flex:0 0 58px}.liftTop.apexPhotoTop{align-items:center}.liftTop.apexPhotoTop .num{display:none}
  .liftPrescription{margin:0 12px 8px;border:1px solid rgba(255,138,50,.25);background:var(--accentDim);border-radius:11px;padding:10px 11px}.liftPrescription .loadRow{display:flex;align-items:baseline;justify-content:space-between;gap:10px}.liftPrescription strong{font-size:20px;color:var(--accent2)}.liftPrescription .loadLabel{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}.plateLine{font-size:10px;color:#d4d7da;margin-top:5px;line-height:1.55}.plateChips{display:inline-flex;gap:3px;margin-left:4px;vertical-align:middle}.plateChip{display:inline-flex;min-width:24px;height:20px;padding:0 5px;align-items:center;justify-content:center;border-radius:5px;background:#242b31;color:#f5f4f1;font-size:9px;border:1px solid #343c43}
  .workoutFormLink{margin:0 12px 5px!important;min-height:42px!important}.singleModeNote{margin:0 0 12px;padding:9px 11px;border-radius:10px;background:rgba(255,138,50,.10);border:1px solid rgba(255,138,50,.2);font-size:10px;color:#d8dde1}
  .progressSummary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:18px}.progressSummary>div{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:12px}.progressSummary small{display:block;color:var(--muted);font-size:9px}.progressSummary b{display:block;font-size:18px;margin-top:5px}.progressGroup{margin:18px 0 8px;color:#c5cbd0;font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase}.progressExercise{width:100%;display:grid;grid-template-columns:58px 1fr auto;gap:10px;align-items:center;text-align:left;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:13px;padding:9px;margin-bottom:8px}.progressExercise img{width:58px;height:52px;border-radius:9px;object-fit:cover;background:#1a1f24}.progressExercise h4{margin:0 0 3px;font-size:13px}.progressExercise p{margin:0;color:var(--muted);font-size:9.5px}.progressExercise .lastLoad{color:var(--accent2);margin-top:4px;font-weight:700}.progressExercise .arrow{color:var(--accent);font-size:21px}.progressEmpty{padding:15px;border:1px dashed #39424a;border-radius:12px;color:var(--muted);font-size:11px;line-height:1.55;margin:12px 0}.progressDetailHero{display:grid;grid-template-columns:76px 1fr;gap:12px;align-items:center;margin-bottom:12px}.progressDetailHero img{width:76px;height:70px;border-radius:11px;object-fit:cover;background:#1a1f24}.progressDetailHero h2{margin:0 0 4px;font-size:21px}.progressDetailHero p{margin:0;color:var(--muted);font-size:10px}.progressChart{height:170px;border:1px solid var(--line);background:linear-gradient(to top,rgba(255,138,50,.06),transparent);border-radius:13px;padding:10px;margin:14px 0}.progressChart svg{width:100%;height:100%;overflow:visible}.progressChartLabel{display:flex;justify-content:space-between;color:var(--muted);font-size:8px;margin-top:-8px}.progressMetricGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.progressMetricGrid>div{background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:11px}.progressMetricGrid small{display:block;color:var(--muted);font-size:8.5px}.progressMetricGrid b{display:block;margin-top:5px;font-size:15px}.progressRecent{margin-top:16px}.progressRecentRow{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--line);font-size:10px}.progressRecentRow span{color:var(--muted)}
  `;
  document.head.appendChild(s);
}
function setActiveNav(label){document.querySelectorAll('.bottom .nav').forEach(b=>b.classList.toggle('active',(b.querySelector('.navLabel')?.textContent||'').trim()===label));}
function removeLogTab(){
  const bottom=document.querySelector('.bottom');if(!bottom)return;
  [...bottom.querySelectorAll('.nav')].forEach(b=>{const label=(b.querySelector('.navLabel')?.textContent||'').trim();if(label==='Log')b.remove();if(label==='Progress')b.setAttribute('onclick','openApexProgress(this)');});
  bottom.classList.add('apex-three-nav');
}
function normalizeProgramLinks(){document.querySelectorAll('#programList .exercise').forEach(card=>{const name=(card.querySelector('h4')?.textContent||'').trim(),link=card.querySelector('.formLink');if(name&&link)link.href=yt(name);});}
function decorateLift(lift){
  const name=(lift.dataset.name||lift.querySelector('h4')?.textContent||'').trim();if(!name)return;
  const e=meta(name);if(!e)return;const load=recommendedLoad(name);const top=lift.querySelector('.liftTop');
  if(top&&!top.querySelector('.workoutExercisePhoto')){top.classList.add('apexPhotoTop');const photo=document.createElement('img');photo.className='workoutExercisePhoto';photo.src=exerciseImage(name);photo.alt=name;photo.onerror=()=>safeImg(photo);top.prepend(photo);}
  if(!lift.querySelector('.liftPrescription')){const box=document.createElement('div');box.className='liftPrescription';const plate=plateBreakdown(name,load);box.innerHTML=`<div class="loadRow"><div><div class="loadLabel">Recommended load</div><strong>${name==='Pull Up'?'Bodyweight':load+' lb'}</strong></div><div class="loadLabel">${e[2]} sets · ${e[3]} reps</div></div>${plate?`<div class="plateLine">${plate}</div>`:''}`;top?.after(box);}
  lift.querySelectorAll('.weight').forEach(input=>{if(name==='Pull Up'){input.value='0';input.placeholder='BW';}else if(Number(input.value)!==load)input.value=load;});
  if(!lift.querySelector('.workoutFormLink')){const link=document.createElement('a');link.className='formLink workoutFormLink';link.href=yt(name);link.target='_blank';link.rel='noopener';link.innerHTML=youtubeIcon+' Watch proper form';const sets=lift.querySelector('.sets');if(sets)lift.insertBefore(link,sets);else lift.appendChild(link);}
}
function decorateWorkout(){document.querySelectorAll('#workoutList .lift').forEach(decorateLift);if(singleExercise)applySingleMode();}
function renderHomeFlow(){
  const home=document.querySelector('#home .content');if(!home)return;let mount=document.getElementById('apexHomeFlow');if(!mount){mount=document.createElement('div');mount.id='apexHomeFlow';mount.className='homeFlow';home.appendChild(mount);}
  const d=day(),exercises=d.groups.flatMap(g=>g[2]),signature=activeDay+'|'+exercises.map(e=>e[0]+':'+recommendedLoad(e[0])).join('|');if(mount.dataset.signature===signature)return;mount.dataset.signature=signature;
  const chooser=DAYS.map((x,i)=>`<button class="sessionChoice ${i===activeDay?'active':''}" onclick="chooseApexSession(${i})">${x.name.replace(' Day','')}</button>`).join('');
  const cards=exercises.map(e=>{const load=recommendedLoad(e[0]),plate=plateBreakdown(e[0],load);return `<button class="homeExercise" onclick="startApexExercise('${e[0].replace(/'/g,"\\'")}')"><img src="${exerciseImage(e[0])}" alt="${e[0]}" onerror="safeImg(this)"><div><h4>${e[0]}</h4><p>${e[2]} sets · ${e[3]} reps · ${e[1]}</p><p class="homeLoad">${e[0]==='Pull Up'?'Bodyweight':load+' lb'}${plate?' · '+plate.replace(/<[^>]+>/g,''):''}</p></div><span class="go">›</span></button>`;}).join('');
  mount.innerHTML=`<div class="homeFlowHead"><div><small>RECOMMENDED TODAY</small><h3>${d.name}</h3></div><small>Tap an exercise to start logging</small></div><div class="sessionChooser">${chooser}</div>${cards}`;
  const start=document.querySelector('#home .start');if(start)start.textContent='Start recommended workout →';
}
window.chooseApexSession=function(i){activeDay=i;localStorage.apexDay=i;updateHome();renderProgram();renderHomeFlow();toast(`${DAYS[i].name} selected`);};
window.startApexExercise=function(name){singleExercise=name;singleOrigin='home';openWorkout();setActiveNav('Home');setTimeout(applySingleMode,0);};
function applySingleMode(){
  if(!singleExercise)return;const list=document.getElementById('workoutList');if(!list)return;list.querySelectorAll('.lift').forEach(l=>l.style.display=l.dataset.name===singleExercise?'':'none');list.querySelectorAll('.groupHead').forEach(h=>h.style.display='none');let note=list.querySelector('.singleModeNote');if(!note){note=document.createElement('div');note.className='singleModeNote';list.prepend(note);}note.textContent=`Logging ${singleExercise}. Finish this exercise and you’ll return to Home.`;const finish=document.querySelector('#workout .finish');if(finish){finish.textContent='Done';finish.setAttribute('onclick','finishApexExercise()');}
}
window.finishApexExercise=function(){
  if(!singleExercise)return finishWorkout();const el=[...document.querySelectorAll('#workoutList .lift')].find(x=>x.dataset.name===singleExercise);if(!el)return;const minRep=Number(el.dataset.min),done=[...el.querySelectorAll('.setrow')].filter(r=>r.querySelector('.check').classList.contains('done'));if(!done.length){toast('Complete at least one set first');return;}const weight=Number(done[0].querySelector('.weight').value)||0,sets=done.map(r=>({reps:Number(r.querySelector('.reps').value)||0,minRep}));hist(singleExercise).push({date:new Date().toLocaleDateString('en-CA'),weight,sets,minRep});save();clearInterval(timerInt);const completedName=singleExercise;singleExercise=null;const finish=document.querySelector('#workout .finish');if(finish){finish.textContent='Finish';finish.setAttribute('onclick','finishWorkout()');}updateHome();show(singleOrigin==='program'?'program':'home');setActiveNav(singleOrigin==='program'?'Program':'Home');toast(`${completedName} saved`);
};
function progressTopSetup(title,backAction){
  const screen=document.getElementById('history');if(!screen)return null;show('history');setActiveNav('Progress');
  const top=screen.querySelector('.top'),back=top?.querySelector('.back'),name=top?.querySelector('#historyName'),action=top?.querySelector('.topAction');if(back){back.style.visibility='visible';back.setAttribute('onclick',backAction);}if(name)name.textContent=title;if(action)action.style.visibility='hidden';return screen.querySelector('.content');
}
window.openApexProgress=function(){
  const content=progressTopSetup('Progress',"show('home');setActiveNav('Home')");if(!content)return;
  const tracked=allExercises().filter(e=>hist(e[0]).length).length,totalSessions=allExercises().reduce((n,e)=>n+hist(e[0]).length,0),ready=allExercises().filter(e=>last(e[0])&&recommendedLoad(e[0])>(Number(last(e[0]).weight)||0)).length;
  let html=`<div class="progressSummary"><div><small>Tracked lifts</small><b>${tracked}</b></div><div><small>Logged sessions</small><b>${totalSessions}</b></div><div><small>Ready to add</small><b>${ready}</b></div></div>`;
  DAYS.forEach(d=>{html+=`<div class="progressGroup">${d.name}</div>`;d.groups.flatMap(g=>g[2]).forEach(e=>{const h=hist(e[0]),l=h.at(-1),reps=topReps(l),next=recommendedLoad(e[0]);html+=`<button class="progressExercise" onclick="openApexExerciseProgress('${e[0].replace(/'/g,"\\'")}')"><img src="${exerciseImage(e[0])}" alt="${e[0]}" onerror="safeImg(this)"><div><h4>${e[0]}</h4><p>${h.length?h.length+' logged session'+(h.length===1?'':'s'):'No logged sessions yet'}</p><p class="lastLoad">${l?(e[0]==='Pull Up'?`${reps} reps`:`${l.weight} lb × ${reps}`):`Next: ${e[0]==='Pull Up'?'Bodyweight':next+' lb'}`}</p></div><span class="arrow">›</span></button>`;});});
  content.innerHTML=html;scrollTo(0,0);
};
window.openApexExerciseProgress=function(name){
  const e=meta(name);if(!e)return;const content=progressTopSetup(name,'openApexProgress()');if(!content)return;const h=hist(name),lastSession=h.at(-1),next=recommendedLoad(name),plate=plateBreakdown(name,next);
  let chart='';
  if(h.length){const data=h.slice(-8).map(s=>name==='Pull Up'?topReps(s):estimate1RM(s,name)),min=Math.min(...data),max=Math.max(...data),span=Math.max(1,max-min),pts=data.map((v,i)=>{const x=data.length===1?160:12+i*(296/(data.length-1)),y=138-((v-min)/span)*116;return `${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ');chart=`<div class="progressChart"><svg viewBox="0 0 320 150" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="#ff8a32" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="progressChartLabel"><span>${h.slice(-8)[0].date}</span><span>${lastSession.date}</span></div>`;}else chart=`<div class="progressEmpty">No history for ${name} yet. Log your first working set and Apex will build the trend here automatically.</div>`;
  const reps=topReps(lastSession),oneRM=lastSession?(name==='Pull Up'?`${reps} reps`:estimate1RM(lastSession,name)+' lb'):'—',top=lastSession?(name==='Pull Up'?`${reps} reps`:`${lastSession.weight} lb × ${reps}`):'—';
  const recent=h.slice(-5).reverse().map(s=>`<div class="progressRecentRow"><span>${s.date}</span><b>${name==='Pull Up'?topReps(s)+' reps':`${s.weight} lb × ${topReps(s)}`}</b></div>`).join('');
  content.innerHTML=`<div class="progressDetailHero"><img src="${exerciseImage(name)}" alt="${name}" onerror="safeImg(this)"><div><h2>${name}</h2><p>${e[1]} · ${e[2]} sets · ${e[3]} reps</p><p style="color:var(--accent2);margin-top:5px">Next: ${name==='Pull Up'?'Bodyweight':next+' lb'}</p></div></div>${plate?`<div class="liftPrescription"><div class="plateLine">${plate}</div></div>`:''}${chart}<div class="progressMetricGrid"><div><small>${name==='Pull Up'?'Best reps':'Est. 1RM'}</small><b>${oneRM}</b></div><div><small>Next load</small><b>${name==='Pull Up'?'BW':next+' lb'}</b></div><div><small>Top set</small><b>${top}</b></div></div><div class="progressRecent"><div class="progressGroup">Recent sessions</div>${recent||'<div class="progressEmpty">Your completed sets will appear here.</div>'}</div>`;scrollTo(0,0);
};
window.openHistory=function(name){openApexExerciseProgress(name);};
function scheduleRun(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;run();});}
function run(){ensureStyles();removeLogTab();normalizeProgramLinks();decorateWorkout();renderHomeFlow();}
const observer=new MutationObserver(scheduleRun);
const start=()=>{run();observer.observe(document.body,{childList:true,subtree:true});};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();