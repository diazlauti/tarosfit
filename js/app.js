(function(){
"use strict";

var I_TRASH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>';
var I_EDIT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
var I_CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
var I_SWAP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>';
var I_UP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
var I_DOWN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>';
var I_FLAME='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3-3 4.5-3 8a3 3 0 0 0 6 0c0-1.2-.7-2-.7-2 1.7 1 2.7 2.8 2.7 4.5a5 5 0 0 1-10 0C7 9 10 7 12 3z"/></svg>';
var I_REFRESH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"/></svg>';
var I_GEAR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z"/></svg>';

/* rutina base: cada ejercicio referencia una clave de EXDB */
var SEED=[
 {name:"Rutina A",ex:[["sentadilla",3,"10-12"],["press-banca",3,"10-12"],["remo-barra",3,"10-12"],
   ["press-militar",3,"10-12"],["curl-femoral",3,"12-15"],["face-pull",3,"15"],["plancha",3,"60 seg"]]},
 {name:"Rutina B",ex:[["peso-muerto-rumano",3,"10-12"],["press-inclinado",3,"10-12"],["jalon",3,"10-12"],
   ["elevaciones-laterales",3,"12-15"],["extension-cuadriceps",3,"12-15"],["curl-biceps",3,"12"],
   ["plancha",3,"60 seg"]]},
 {name:"Rutina C",ex:[["prensa",3,"12"],["fondos",3,"8-12"],["remo-mancuerna",3,"10-12"],
   ["hip-thrust",3,"12"],["gemelos",3,"15"],["triceps-polea",3,"12-15"],["abdominales",3,"12"],
   ["plancha",3,"60 seg"]]}
];

var S={days:[],sessions:[],tab:"hoy",ui:{},work:null,workDate:null,gi:0,
  progEx:null,openS:null,summary:null,expandDay:null,pickOpen:false,swapOpen:null,editSetsFor:null,
  groupId:null,groupBoard:null,groupBusy:false,settingsOpen:false,showTips:false,
  timer:{total:90,left:90,run:false,iv:null,endAt:0}};
var pending=null;

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function el(id){return document.getElementById(id)}
function short(iso){try{return new Date(iso).toLocaleDateString("es-AR",{day:"numeric",month:"short"})}catch(e){return""}}
function shortWk(iso){try{var s=new Date(iso).toLocaleDateString("es-AR",{weekday:"short",day:"numeric",month:"short"});return s.charAt(0).toUpperCase()+s.slice(1)}catch(e){return""}}
function wkName(dt){try{var s=(dt||new Date()).toLocaleDateString("es-AR",{weekday:"long"});return s.charAt(0).toUpperCase()+s.slice(1)}catch(e){return""}}
function longD(iso){try{var s=new Date(iso).toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});return s.charAt(0).toUpperCase()+s.slice(1)}catch(e){return""}}
function mmss(n){var m=Math.floor(n/60),s=n%60;return m+":"+(s<10?"0":"")+s}
function localDateStr(dt){dt=dt||new Date();var y=dt.getFullYear(),m=dt.getMonth()+1,d=dt.getDate();
  return y+"-"+(m<10?"0":"")+m+"-"+(d<10?"0":"")+d}
function dateFromLocalStr(s){var p=(s||"").split("-"),n=new Date();
  var y=parseInt(p[0],10),mo=parseInt(p[1],10)-1,da=parseInt(p[2],10);
  if(isNaN(y)||isNaN(mo)||isNaN(da))return n;
  return new Date(y,mo,da,n.getHours(),n.getMinutes(),n.getSeconds())}
function daysAgoLabel(iso){var n=Math.floor((Date.now()-new Date(iso).getTime())/86400000);
  return n<=0?"hoy":n===1?"ayer":"hace "+n+" días"}
function toast(m){var t=el("toast");t.textContent=m;t.classList.add("on");
  clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove("on")},2100)}

/* ---------- almacenamiento ---------- */
var Store={
  get:function(k){return new Promise(function(res){
    var done=false;
    function fb(){if(done)return;done=true;
      try{var v=window.localStorage.getItem(k);res(v?JSON.parse(v):null)}catch(e){res(null)}}
    try{
      if(window.storage&&typeof window.storage.get==="function"){
        Promise.resolve(window.storage.get(k,false)).then(function(r){
          if(done)return;
          if(r&&r.value){done=true;try{res(JSON.parse(r.value))}catch(e){res(null)}}else fb();
        },fb);
        setTimeout(fb,1500);
      }else fb();
    }catch(e){fb()}
  })},
  set:function(k,v){var j;try{j=JSON.stringify(v)}catch(e){return Promise.resolve(false)}
    try{window.localStorage.setItem(k,j)}catch(e){}
    try{if(window.storage&&typeof window.storage.set==="function")
      Promise.resolve(window.storage.set(k,j,false)).catch(function(){})}catch(e){}
    if(k==="gym-days"||k==="gym-sessions")pushCloud();
    return Promise.resolve(true)}
};

/* ---------- sincronizacion con la nube (Firebase) ---------- */
var cloudUid=null,cloudReady=false;
function pushCloud(){
  if(!cloudUid||!cloudReady||!window.firebase)return;
  try{
    firebase.firestore().collection("users").doc(cloudUid).set(
      {days:S.days,sessions:S.sessions,groupId:S.groupId||null,updatedAt:new Date().toISOString()},{merge:true}
    ).catch(function(){});
    if(S.groupId){
      firebase.firestore().collection("groups").doc(S.groupId).collection("members").doc(cloudUid).set(
        {name:window.AppUserName||window.AppUserEmail||"Alguien",streak:weekStreak(),
         weekSessions:weekSessionsCount(),weekVolume:weekVolume(),
         bestSquat:bestBefore("Sentadilla con barra")||null,
         bestBench:bestBefore("Press de banca")||null,
         bestDeadlift:bestBefore("Peso muerto convencional")||null,
         updatedAt:new Date().toISOString()},{merge:true}
      ).catch(function(){});
    }
  }catch(e){}
}
/* devuelve una promesa<boolean>: true si había datos reales en la nube
   (y ya quedaron en S.days/S.sessions), false si no había o falló. boot()
   espera esta respuesta antes de decidir si el usuario es nuevo, para no
   confundir "todavía no llegó de la nube" con "no tiene rutina" */
function attachCloud(uid){
  cloudUid=uid;cloudReady=false;
  if(!window.firebase){cloudReady=true;return Promise.resolve(false)}
  try{
    return firebase.firestore().collection("users").doc(uid).get().then(function(snap){
      if(!snap.exists){cloudReady=true;return false}
      var d=snap.data()||{};
      var had=Array.isArray(d.days)&&d.days.length>0;
      if(Array.isArray(d.days))S.days=d.days;
      if(Array.isArray(d.sessions))S.sessions=d.sessions;
      if(typeof d.groupId==="string"&&d.groupId)S.groupId=d.groupId;
      /* solo cachear en local, sin volver a empujar a la nube lo que
         acabamos de leer de ahí mismo: cloudReady se marca recién después */
      Store.set("gym-days",S.days);Store.set("gym-sessions",S.sessions);
      cloudReady=true;
      if(S.groupId)refreshBoard();
      return had;
    }).catch(function(){cloudReady=true;return false});
  }catch(e){cloudReady=true;return Promise.resolve(false)}
}
function detachCloud(){cloudUid=null;cloudReady=false}
function saveDays(){return Store.set("gym-days",S.days)}
function saveSess(){return Store.set("gym-sessions",S.sessions)}
var DRAFT_MAX_AGE=8*60*60*1000;
function saveDraft(){clearTimeout(saveDraft._t);saveDraft._t=setTimeout(function(){
  if(S.work)Store.set("gym-draft",{dayId:S.work.dayId,dayName:S.work.dayName,date:S.work.date,
    ex:S.work.ex,gi:S.gi,savedAt:new Date().toISOString()});},600)}
function clearDraft(){clearTimeout(saveDraft._t);Store.set("gym-draft",null)}

/* ---------- datos derivados ---------- */
function exMeta(x){return (x.key&&EXDB[x.key])?EXDB[x.key]:null}
function isTimeKey(key){return !!(key&&EXDB[key]&&EXDB[key].unit==="time")}
/* si el registro es de antes de guardar la key, la reconstruye buscando por nombre */
function keyForName(name){for(var k in EXDB){if(EXDB[k].n===name)return k}return null}
function effKey(x){return x.key||keyForName(x.name)}
/* de dónde sea que venga el nombre (rutina actual o historial), ¿se mide en segundos? */
function unitForName(name){
  for(var i=0;i<S.days.length;i++){var dx=S.days[i].ex;
    for(var j=0;j<dx.length;j++)if(exName(dx[j])===name&&dx[j].key)return EXDB[dx[j].key]?EXDB[dx[j].key].unit||"reps":"reps"}
  for(var a=0;a<S.sessions.length;a++){var sx=S.sessions[a].ex;
    for(var b=0;b<sx.length;b++)if(sx[b].name===name){var kk=effKey(sx[b]);if(kk)return EXDB[kk]?EXDB[kk].unit||"reps":"reps"}}
  return "reps";
}
/* ¿la rutina guardada es de una versión anterior? (ejercicios sin foto) */
function needsUpdate(){
  if(!S.days.length)return false;
  for(var i=0;i<S.days.length;i++){
    var d=S.days[i];
    for(var j=0;j<d.ex.length;j++) if(!exMeta(d.ex[j])) return true;
  }
  return false;
}
function updateBanner(){
  return '<div class="card" style="border-left:3px solid var(--rust);margin-bottom:14px">'+
    '<p style="font-size:13.5px;line-height:1.5;margin:0 0 4px"><strong>Tenés la rutina vieja guardada.</strong></p>'+
    '<p style="font-size:12.5px;line-height:1.5;margin:0 0 10px;color:var(--ink-soft)">'+
    'La nueva trae fotos en cada ejercicio, plancha al final de los tres días, y sin pájaros ni hollow hold. '+
    'Tu historial de entrenamientos no se toca.</p>'+
    '<button class="btn sm" data-a="upd-seed">Actualizar rutina</button></div>';
}
function exName(x){var m=exMeta(x);return m?m.n:(x.name||"Ejercicio")}
function lastSessionOverall(){if(!S.sessions.length)return null;
  return S.sessions.slice().sort(function(a,b){return new Date(b.date)-new Date(a.date)})[0]}
function lastSessionForDay(id){var l=S.sessions.filter(function(s){return s.dayId===id});
  if(!l.length)return null;l.sort(function(a,b){return new Date(b.date)-new Date(a.date)});return l[0]}
function nextDay(){if(!S.days.length)return null;
  var lo=lastSessionOverall();if(!lo)return S.days[0];
  for(var k=0;k<S.days.length;k++)if(S.days[k].id===lo.dayId)return S.days[(k+1)%S.days.length];
  return S.days[0]}
function lastSetsFor(n){var so=S.sessions.slice().sort(function(a,b){return new Date(b.date)-new Date(a.date)});
  for(var i=0;i<so.length;i++){var e=so[i].ex.filter(function(x){return x.name===n})[0];
    if(e&&e.sets.length)return e.sets}return null}
function sessionVol(s){var v=0;s.ex.forEach(function(x){x.sets.forEach(function(t){v+=t.w*t.r})});return Math.round(v)}
function sessionSets(s){var n=0;s.ex.forEach(function(x){n+=x.sets.length});return n}
function bestBefore(n){var m=0;S.sessions.forEach(function(s){s.ex.forEach(function(e){
  if(e.name===n)e.sets.forEach(function(t){if(t.w>m)m=t.w})})});return m}

/* semanas seguidas (de a 7 días corridos, terminando hoy) con al menos
   un entrenamiento cada una. No depende de qué día caiga: la rutina no
   sigue un calendario fijo, así que "racha" acá es constancia semanal. */
function weekStreak(){
  if(!S.sessions.length)return 0;
  var dayNums=S.sessions.map(function(s){return Math.floor(new Date(s.date).getTime()/86400000)});
  var today=Math.floor(Date.now()/86400000),streak=0;
  for(var w=0;w<520;w++){
    var to=today-7*w,from=to-6;
    if(!dayNums.some(function(d){return d>=from&&d<=to}))break;
    streak++;
  }
  return streak;
}
function weekSessionsCount(){
  if(!S.sessions.length)return 0;
  var today=Math.floor(Date.now()/86400000);
  return S.sessions.filter(function(s){return Math.floor(new Date(s.date).getTime()/86400000)>=today-6}).length;
}
function weekVolume(){
  if(!S.sessions.length)return 0;
  var today=Math.floor(Date.now()/86400000),v=0;
  S.sessions.forEach(function(s){
    if(Math.floor(new Date(s.date).getTime()/86400000)>=today-6)v+=sessionVol(s);
  });
  return v;
}

/* ---------- grupos con amigos ---------- */
var GROUP_ALPHABET="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0 ni I/1, para que no se confundan al escribirlo
function genCode(){var s="";for(var i=0;i<6;i++)s+=GROUP_ALPHABET[Math.floor(Math.random()*GROUP_ALPHABET.length)];return s}
function setGroup(code){S.groupId=code;S.groupBoard=null;pushCloud();refreshBoard()}
function leaveGroup(){S.groupId=null;S.groupBoard=null;pushCloud();render()}
function refreshBoard(){
  if(!S.groupId||!window.firebase){render();return}
  S.groupBusy=true;render();
  firebase.firestore().collection("groups").doc(S.groupId).collection("members").get().then(function(qs){
    var arr=[];qs.forEach(function(doc){arr.push(doc.data())});
    arr.sort(function(a,b){return (b.streak||0)-(a.streak||0)||(b.weekSessions||0)-(a.weekSessions||0)});
    S.groupBoard=arr;S.groupBusy=false;render();
  }).catch(function(){S.groupBusy=false;render();toast("no se pudo cargar el grupo")});
}

/* ---------- navegación ---------- */
var TITLES={hoy:"Hoy",historial:"Historial",progreso:"Progreso",rutinas:"Rutinas"};
function go(tab){
  S.tab=tab;
  if(tab==="rutinas"&&!S.expandDay){var n=nextDay();S.expandDay=n?n.id:null}
  var vs=document.querySelectorAll(".view");
  for(var i=0;i<vs.length;i++)vs[i].classList.remove("on");
  el("v-"+tab).classList.add("on");
  var ts=document.querySelectorAll(".tab");
  for(var j=0;j<ts.length;j++)ts[j].classList.toggle("on",ts[j].getAttribute("data-tab")===tab);
  el("ttl").textContent=TITLES[tab];
  try{window.scrollTo(0,0)}catch(e){}
  render();
}
function render(){
  if(S.tab==="hoy")rHoy();
  else if(S.tab==="historial")rHistorial();
  else if(S.tab==="progreso")rProgreso();
  else rRutinas();
  var n=S.sessions.length;
  el("sub").textContent = S.tab==="hoy" ? (S.work?"entrenando":wkName())
    : S.tab==="rutinas" ? S.days.length+(S.days.length===1?" rutina":" rutinas")
    : n+(n===1?" entrenamiento":" entrenamientos");
}

/* ---------- HOY ---------- */
function rHoy(){
  if(!S.days.length){
    el("v-hoy").innerHTML='<div class="empty"><span class="big">No hay rutinas</span>'+
      '<p>Cargá la rutina A/B/C para empezar.</p><button class="btn" data-a="seed">cargar rutina A/B/C</button></div>';
    return;
  }
  if(S.summary&&!S.work){rResumen();return}
  if(S.work){rGuiada();return}

  var nd=nextDay(), lo=lastSessionOverall();
  var pick=S.pickDayId?S.days.filter(function(d){return d.id===S.pickDayId})[0]:null;
  var day=pick||nd;
  var wdate=S.workDate||localDateStr();
  var isToday=wdate===localDateStr();
  var lastD=lastSessionForDay(day.id);

  var h=needsUpdate()?updateBanner():"";
  var streak=weekStreak();
  if(streak>0)h+='<div class="streak-pill">'+I_FLAME+' '+streak+(streak===1?" semana seguida entrenando":" semanas seguidas entrenando")+'</div>';
  h+=groupTeaser();
  h+='<div class="next-up"><div class="eyebrow">te toca</div>'+
    '<div class="name">'+esc(day.name)+'</div>'+
    '<div class="why">'+(lo?"último entrenamiento: "+daysAgoLabel(lo.date)+" ("+shortWk(lo.date)+")":"tu primer entrenamiento")+'</div></div>';

  h+='<div class="datefield"><label for="i-workdate">Fecha</label>'+
     '<input type="date" id="i-workdate" value="'+wdate+'" max="'+localDateStr()+'"></div>';
  if(!isToday)h+='<p class="warn-past">Lo vas a guardar como '+shortWk(dateFromLocalStr(wdate).toISOString())+', no como hoy.</p>';

  h+='<div class="card current"><div class="prevlist">';
  day.ex.forEach(function(x){
    h+='<div class="r"><span>'+esc(exName(x))+'</span><span class="t">'+esc(x.sets)+'×'+esc(x.reps)+'</span></div>';
  });
  h+='</div></div>';
  h+='<button class="btn block" data-a="start">'+(isToday?"Empezar entrenamiento":"Cargar ese entrenamiento")+'</button>';

  if(!S.pickOpen){
    h+='<div style="text-align:center;margin-top:12px">'+
       '<button class="ib" style="font-size:12.5px;color:var(--ink-soft);min-width:auto;padding:6px 10px" data-a="open-pick">¿hoy hacés otra? elegir</button></div>';
  }else{
    h+='<p class="today-line" style="margin-top:14px">Elegí cuál vas a hacer:</p><div class="chips">';
    S.days.forEach(function(d){
      h+='<button class="chip'+(d.id===day.id?" on":"")+'" data-a="pick" data-d="'+d.id+'">'+esc(d.name)+'</button>';
    });
    h+='</div>';
  }
  if(lastD)h+='<p style="text-align:center;font-size:11.5px;color:var(--ink-faint);margin-top:10px" class="mono">'+
    esc(day.name)+' la hiciste '+daysAgoLabel(lastD.date)+' · '+shortWk(lastD.date)+'</p>';
  el("v-hoy").innerHTML=h;
}

/* ---------- MODO GUIADO ---------- */
function rGuiada(){
  var w=S.work, i=Math.max(0,Math.min(S.gi,w.ex.length-1)); S.gi=i;
  var x=w.ex[i], meta=x.key&&EXDB[x.key]?EXDB[x.key]:null;
  var pct=Math.round(((i+1)/w.ex.length)*100);

  var h='<div class="gbar"><span class="txt">'+(i+1)+' de '+w.ex.length+'</span>'+
    '<div class="gtrack"><div class="gfill" style="width:'+pct+'%"></div></div>'+
    '<button class="ib" data-a="ask-cancel" aria-label="Cancelar entrenamiento" style="min-width:30px">'+I_TRASH+'</button></div>';

  if(meta&&meta.img){
    h+='<div class="photos">'+
       '<figure><img src="'+meta.img[0]+'" alt="Posición inicial de '+esc(x.name)+'" loading="lazy"><figcaption>inicio</figcaption></figure>'+
       '<figure><img src="'+meta.img[1]+'" alt="Posición final de '+esc(x.name)+'" loading="lazy"><figcaption>final</figcaption></figure>'+
       '</div>';
  }
  h+='<h2 class="gname">'+esc(x.name)+'</h2>';
  h+='<div class="gtarget">objetivo '+esc(x.tSets)+' × '+esc(x.tReps)+'</div>';
  if(x.swapped)h+='<p class="swapnote">cambiado por '+esc(x.swapped)+' · <button class="linkbtn" data-a="unswap" data-x="'+i+'">deshacer</button></p>';
  if(x.prev)h+='<p class="glast">última vez: '+esc(x.prev)+'</p>';
  if(!meta)h+='<p class="nophoto">Ejercicio agregado por vos: no tiene foto en la biblioteca.</p>';

  if(meta){
    h+='<p class="gcue">'+esc(meta.cue)+'</p>';
    h+='<div class="gtips"><h4>Errores más comunes</h4><ul>';
    meta.tips.forEach(function(t){h+='<li>'+esc(t)+'</li>'});
    h+='</ul></div>';
  }

  if(meta){
    var alts=alternativas(x.key);
    if(S.swapOpen===i&&alts.length){
      h+='<div class="card"><p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 10px">'+
         '¿Ocupada la máquina? Elegí otro de '+esc((GRUPOS[meta.g]||meta.g).toLowerCase())+':</p>';
      alts.forEach(function(k){
        h+='<button class="altrow" data-a="do-swap" data-x="'+i+'" data-k="'+k+'">'+
           '<img src="'+EXDB[k].img[1]+'" alt="">'+
           '<span>'+esc(EXDB[k].n)+'</span></button>';
      });
      h+='<div style="margin-top:8px"><button class="btn ghost sm" data-a="swap-close">Cancelar</button></div></div>';
    }else if(alts.length){
      h+='<button class="swapbtn" data-a="swap-open" data-x="'+i+'">'+I_SWAP+' cambiar por otro de '+esc((GRUPOS[meta.g]||meta.g).toLowerCase())+'</button>';
    }
  }
  h+='<div class="card">';
  var lastArr=x.prevSets||null;
  var isTimeEx=isTimeKey(x.key);
  x.sets.forEach(function(st,si){
    var ok=isTimeEx?(st.r!==""):(st.w!==""&&st.r!=="");
    var lp=lastArr&&lastArr[si]?lastArr[si]:null;
    if(isTimeEx){
      h+='<div class="srow-time'+(ok?" ok":"")+'"><span class="n">'+(si+1)+'</span>'+
        '<input type="number" inputmode="numeric" placeholder="'+(lp?lp.r:"segundos")+'" value="'+esc(st.r)+'" data-x="'+i+'" data-s="'+si+'" data-f="r">'+
        '<span class="unit">seg</span>'+
        '<span class="ck">'+I_CHECK+'</span></div>';
    }else{
      h+='<div class="srow'+(ok?" ok":"")+'"><span class="n">'+(si+1)+'</span>'+
        '<input type="number" inputmode="decimal" step="any" placeholder="'+(lp?lp.w:"kg")+'" value="'+esc(st.w)+'" data-x="'+i+'" data-s="'+si+'" data-f="w">'+
        '<input type="number" inputmode="numeric" placeholder="'+(lp?lp.r:"reps")+'" value="'+esc(st.r)+'" data-x="'+i+'" data-s="'+si+'" data-f="r">'+
        '<span class="ck">'+I_CHECK+'</span></div>';
    }
  });
  h+='<div style="display:flex;gap:8px;margin-top:8px">'+
     '<button class="addset" data-a="add-set" data-x="'+i+'">+ serie</button>'+
     '<button class="restbtn" data-a="rest">descanso 90s</button></div></div>';

  h+='<div class="gnav">'+
     '<button class="btn ghost" data-a="prev"'+(i===0?" disabled":"")+'>← anterior</button>'+
     (i<w.ex.length-1
       ? '<button class="btn" data-a="next">siguiente →</button>'
       : '<button class="btn" data-a="finish">Finalizar</button>')+
     '</div>';
  if(i<w.ex.length-1)h+='<button class="btn ghost block" style="margin-top:8px" data-a="finish">Terminar acá</button>';

  el("v-hoy").innerHTML=h;
}

/* ---------- RESUMEN ---------- */
function rResumen(){
  var m=S.summary;
  var h='<div class="next-up"><div class="eyebrow">terminado · '+shortWk(m.date)+'</div>'+
    '<div class="name">'+esc(m.dayName)+'</div><div class="why">guardado en tu historial</div></div>';
  h+='<div class="stats">'+
     '<div class="stat"><div class="n">'+m.sets+'<span style="font-size:11px">/'+m.planned+'</span></div><div class="l">series hechas</div></div>'+
     '<div class="stat"><div class="n">'+m.vol.toLocaleString("es-AR")+'<span style="font-size:11px">kg</span></div><div class="l">total movido</div></div>'+
     '<div class="stat"><div class="n">'+m.exCount+'<span style="font-size:11px">/'+m.exTotal+'</span></div><div class="l">ejercicios</div></div></div>';
  if(m.prs.length){
    h+='<div class="card" style="border-left:3px solid var(--rust)">'+
       '<div style="font-family:var(--display);font-size:16px;color:var(--rust);margin-bottom:6px">Récord personal</div>';
    m.prs.forEach(function(p){h+='<div class="exb"><div class="en">'+esc(p.name)+'</div>'+
      '<div class="es">'+p.w+'kg — antes '+p.before+'kg</div></div>'});
    h+='</div>';
  }
  h+='<div class="card">';
  m.rows.forEach(function(r){h+='<div class="exrow"><span class="nm">'+esc(r.name)+'</span>'+
    '<span class="tg">'+r.n+' ser · '+(r.isTime?r.secTot+'seg totales':r.vol.toLocaleString("es-AR")+'kg')+'</span></div>'});
  h+='</div>';
  h+='<p style="font-size:12px;color:var(--ink-faint);text-align:center;line-height:1.5;margin:0 0 14px">'+
     '«total movido» = peso × repeticiones de cada serie. Si sube semana a semana, progresás.</p>';
  h+='<button class="btn block" data-a="close-sum">Listo</button>';
  el("v-hoy").innerHTML=h;
}

function startWork(){
  var nd=nextDay();
  var id=S.pickDayId||(nd&&nd.id);
  var d=S.days.filter(function(x){return x.id===id})[0];
  if(!d)return;
  if(!d.ex.length){toast("esa rutina no tiene ejercicios");return}
  S.work={dayId:d.id,dayName:d.name,date:dateFromLocalStr(S.workDate||localDateStr()).toISOString(),
    ex:d.ex.map(function(x){
      var nm=exName(x), prev=lastSetsFor(nm);
      var n=parseInt(x.sets,10);if(isNaN(n)||n<1)n=3;if(n>12)n=12;
      var timeEx=isTimeKey(x.key);
      var arr=[];for(var i=0;i<n;i++)arr.push({w:timeEx?"0":"",r:""});
      return{key:x.key||null,name:nm,tSets:x.sets,tReps:x.reps,prevSets:prev||null,
        prev:prev?prev.map(function(s){return s.w+"×"+s.r}).join("  "):null,sets:arr};
    })};
  S.gi=0;render();saveDraft();
}

function finishWork(){
  var ex=S.work.ex.map(function(x){
    var timeEx=isTimeKey(x.key);
    return{name:x.name,key:x.key||null,sets:x.sets.filter(function(s){
        return timeEx?(s.r!==""):(s.w!==""&&s.r!=="");
      })
      .map(function(s){return{w:timeEx?0:parseFloat(s.w),r:parseInt(s.r,10)}})
      .filter(function(s){return !isNaN(s.w)&&!isNaN(s.r)&&s.w>=0&&s.r>0})};
  }).filter(function(x){return x.sets.length});
  if(!ex.length){toast("cargá al menos una serie");return}
  var prs=[];
  ex.forEach(function(x){
    if(isTimeKey(x.key))return; // el "récord" de peso no aplica a ejercicios por tiempo
    var mx=0;x.sets.forEach(function(t){if(t.w>mx)mx=t.w});
    var pv=bestBefore(x.name);if(pv>0&&mx>pv)prs.push({name:x.name,w:mx,before:pv});
  });
  var sess={id:uid(),date:S.work.date||new Date().toISOString(),dayId:S.work.dayId,dayName:S.work.dayName,ex:ex};
  var planned=0;S.work.ex.forEach(function(x){planned+=x.sets.length});
  S.summary={dayName:sess.dayName,date:sess.date,sets:sessionSets(sess),planned:planned,vol:sessionVol(sess),
    exCount:ex.length,exTotal:S.work.ex.length,prs:prs,
    rows:ex.map(function(x){
      var timeEx=isTimeKey(x.key), v=0,mx=0,secTot=0;
      x.sets.forEach(function(t){v+=t.w*t.r;if(t.w>mx)mx=t.w;secTot+=t.r});
      return{name:x.name,n:x.sets.length,vol:Math.round(v),max:mx,isTime:timeEx,secTot:secTot};
    })};
  S.sessions.push(sess);saveSess();clearDraft();
  S.work=null;S.workDate=null;S.pickDayId=null;S.pickOpen=false;S.expandDay=null;S.gi=0;
  render();try{window.scrollTo(0,0)}catch(e){}
}

/* ---------- HISTORIAL ---------- */
function rHistorial(){
  if(!S.sessions.length){
    el("v-historial").innerHTML='<div class="empty"><span class="big">Sin entrenamientos</span>'+
      '<p>Acá se guarda cada entrenamiento cuando terminás el primero.</p></div>';return;
  }
  var list=S.sessions.slice().sort(function(a,b){return new Date(b.date)-new Date(a.date)});
  var h="";
  list.forEach(function(s){
    h+='<div class="card"><div data-a="toggle" data-s="'+s.id+'" style="cursor:pointer">'+
      '<div class="shead"><span class="dt">'+longD(s.date)+'</span>'+
      '<span class="sm">'+esc(s.dayName)+' · '+sessionSets(s)+' series · '+sessionVol(s).toLocaleString("es-AR")+'kg</span></div></div>'+
      '<div class="sdetail'+(S.openS===s.id?" on":"")+'">';
    s.ex.forEach(function(x,xi){
      var timeEx=isTimeKey(effKey(x));
      var editKey=s.id+"|"+xi;
      if(S.editSetsFor===editKey){
        h+='<div class="exb"><div class="en">'+esc(x.name)+'</div>';
        x.sets.forEach(function(t,si){
          if(timeEx){
            h+='<div class="editset"><span class="n">'+(si+1)+'</span>'+
              '<input type="number" inputmode="numeric" value="'+esc(t.r)+'" data-hs="'+s.id+'" data-hx="'+xi+'" data-hsi="'+si+'" data-f="r"><span class="unit">seg</span></div>';
          }else{
            h+='<div class="editset"><span class="n">'+(si+1)+'</span>'+
              '<input type="number" inputmode="decimal" step="any" value="'+esc(t.w)+'" data-hs="'+s.id+'" data-hx="'+xi+'" data-hsi="'+si+'" data-f="w"><span class="unit">kg</span>'+
              '<input type="number" inputmode="numeric" value="'+esc(t.r)+'" data-hs="'+s.id+'" data-hx="'+xi+'" data-hsi="'+si+'" data-f="r"><span class="unit">reps</span></div>';
          }
        });
        h+='<div class="actrow"><button class="btn sm" data-a="save-editsess" data-hs="'+s.id+'" data-hx="'+xi+'">Guardar</button>'+
           '<button class="btn sm ghost" data-a="x-editsess">Cancelar</button></div></div>';
      }else{
        h+='<div class="exb"><div class="en">'+esc(x.name)+
           '<button class="ib" data-a="edit-exsess" data-hs="'+s.id+'" data-hx="'+xi+'" aria-label="Editar" style="min-width:26px;min-height:26px;float:right">'+I_EDIT+'</button></div>'+
           '<div class="es">'+x.sets.map(function(t){return timeEx?(t.r+"seg"):(t.w+"kg × "+t.r)}).join("   ")+'</div></div>';
      }
    });
    if(S.ui.delSess===s.id){
      h+='<div class="confirm"><span>¿Eliminar este entrenamiento?</span>'+
        '<button class="btn sm danger" data-a="del-sess" data-s="'+s.id+'">Sí</button>'+
        '<button class="btn sm ghost" data-a="x-delsess">No</button></div>';
    }else{
      h+='<div style="display:flex;justify-content:flex-end"><button class="ib danger" data-a="ask-delsess" data-s="'+s.id+'" aria-label="Eliminar">'+I_TRASH+'</button></div>';
    }
    h+='</div></div>';
  });
  el("v-historial").innerHTML=h;
}

/* ---------- PROGRESO ---------- */
function allExNames(){var m={};
  S.days.forEach(function(d){d.ex.forEach(function(x){m[exName(x)]=1})});
  S.sessions.forEach(function(s){s.ex.forEach(function(x){m[x.name]=1})});
  return Object.keys(m).sort(function(a,b){return a.localeCompare(b,"es")})}
function rProgreso(){
  var names=allExNames();
  if(!names.length){el("v-progreso").innerHTML='<div class="empty"><span class="big">Nada que mostrar</span><p>Registrá un entrenamiento para ver tu progreso.</p></div>';return}
  if(!S.progEx||names.indexOf(S.progEx)===-1){
    S.progEx=names[0];
    var lo=lastSessionOverall();
    if(lo&&lo.ex.length&&names.indexOf(lo.ex[0].name)!==-1)S.progEx=lo.ex[0].name;
  }
  var h='<select id="sel-ex">';
  names.forEach(function(n){h+='<option value="'+esc(n)+'"'+(n===S.progEx?" selected":"")+'>'+esc(n)+'</option>'});
  h+='</select>';
  var isTime=unitForName(S.progEx)==="time";
  var pts=[];
  S.sessions.forEach(function(s){var x=s.ex.filter(function(e){return e.name===S.progEx})[0];
    if(x&&x.sets.length){
      var mx=0;x.sets.forEach(function(t){var v=isTime?t.r:t.w;if(v>mx)mx=v});
      pts.push({d:s.date,w:mx});
    }});
  pts.sort(function(a,b){return new Date(a.d)-new Date(b.d)});
  if(!pts.length){el("v-progreso").innerHTML=h+'<div class="empty"><p>Todavía no registraste series de este ejercicio.</p></div>';bindSel();return}
  var mx=0;pts.forEach(function(p){if(p.w>mx)mx=p.w});
  var last=pts[pts.length-1];
  var unitLbl=isTime?"seg":"kg";
  h+='<div class="stats" style="margin-top:12px">'+
    '<div class="stat"><div class="n">'+mx+'<span style="font-size:11px">'+unitLbl+'</span></div><div class="l">'+(isTime?"mejor marca":"máximo")+'</div></div>'+
    '<div class="stat"><div class="n">'+last.w+'<span style="font-size:11px">'+unitLbl+'</span></div><div class="l">última vez</div></div>'+
    '<div class="stat"><div class="n">'+pts.length+'</div><div class="l">sesiones</div></div></div>';
  h+='<div class="card">'+chart(pts,mx)+'<p style="font-size:11.5px;color:var(--ink-faint);text-align:center;margin:6px 0 0">'+
     (isTime?"segundos sostenidos por sesión":"peso máximo por sesión")+'</p></div>';
  el("v-progreso").innerHTML=h;bindSel();
}
function bindSel(){var s=el("sel-ex");if(s)s.onchange=function(){S.progEx=s.value;rProgreso()}}
function chart(pts,mx){
  var w=320,h=175,pl=14,pr=14,pt=24,pb=26,iw=w-pl-pr,ih=h-pt-pb,ymax=(mx*1.18)||10;
  var step=pts.length>1?iw/(pts.length-1):0;
  var co=pts.map(function(p,i){return{x:pl+(pts.length>1?i*step:iw/2),y:pt+ih-(p.w/ymax)*ih,p:p}});
  var line=co.map(function(c){return c.x.toFixed(1)+","+c.y.toFixed(1)}).join(" ");
  var bi=0;pts.forEach(function(p,i){if(p.w>pts[bi].w)bi=i});
  var g="";
  co.forEach(function(c,i){var isMax=(i===bi);
    g+='<circle cx="'+c.x+'" cy="'+c.y+'" r="'+(isMax?4.5:3.4)+'" fill="'+(isMax?"var(--rust)":"var(--accent)")+'"/>';
    g+='<text x="'+c.x+'" y="'+(c.y-9)+'" text-anchor="middle" class="lbl">'+c.p.w+'</text>';
    if(isMax)g+='<text x="'+c.x+'" y="'+(c.y-20)+'" text-anchor="middle" class="prm">PR</text>';
    if(i===0||i===co.length-1||co.length<=5)g+='<text x="'+c.x+'" y="'+(h-6)+'" text-anchor="middle" class="lbl">'+short(c.p.d)+'</text>'});
  return '<svg class="chart" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="xMidYMid meet">'+
    '<line x1="'+pl+'" y1="'+(pt+ih)+'" x2="'+(w-pr)+'" y2="'+(pt+ih)+'" stroke="var(--line)" stroke-width="1.5"/>'+
    '<polyline points="'+line+'" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'+g+'</svg>';
}

/* ---------- RUTINAS (edición) ---------- */
function rRutinas(){
  var nd=nextDay();
  var h=needsUpdate()?updateBanner():"";
  h+='<p class="today-line">Hoy es '+wkName()+'. Acá editás las rutinas; la de hoy se muestra sola en la pestaña Hoy. '+
    '<button class="linkbtn" style="font-size:12.5px" data-a="toggle-tips">¿cómo funciona?</button></p>';
  if(S.showTips){
    h+='<div class="card" style="background:transparent;box-shadow:none;border:1px dashed var(--line)">'+
      '<p style="font-size:12.5px;color:var(--ink-soft);line-height:1.6;margin:0">'+
      '<strong>La rueda:</strong> no importa el día de la semana ni cuántas veces vayas. Hacés la que dice «te toca» y sigue sola: A → B → C → A…<br><br>'+
      '<strong>Esfuerzo:</strong> dejá 1-2 repeticiones en reserva en todo lo pesado. Al fallo solo en la última serie de aislamiento (curl, laterales, tríceps, gemelos).<br><br>'+
      '<strong>Progresión:</strong> si completás todas las series en el tope del rango y te sobran 2 reps, subís 2,5kg arriba o 5kg en piernas.</p></div>';
  }
  h+='<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px">'+
    '<button class="btn sm" data-a="new-day">+ rutina</button></div>';
  if(S.ui.newDay){
    h+='<div class="card"><div class="frow"><input type="text" id="i-day" class="f2" placeholder="nombre de la rutina"></div>'+
      '<div class="actrow"><button class="btn sm" data-a="save-day">Crear</button>'+
      '<button class="btn sm ghost" data-a="x-newday">Cancelar</button></div></div>';
  }
  if(!S.days.length&&!S.ui.newDay){
    h+='<div class="empty"><span class="big">No hay rutinas</span>'+
      '<p>Respondé un cuestionario rápido y armamos una a tu medida, o cargá la clásica de cuerpo completo.</p>'+
      '<button class="btn" data-a="wizard-open">Generar con cuestionario</button>'+
      '<button class="btn ghost" style="margin-top:8px" data-a="seed">cargar rutina A/B/C</button></div>';
  }
  S.days.forEach(function(d){
    var editing=S.ui.editDay===d.id||S.ui.delDay===d.id||S.ui.addEx===d.id||
      (S.ui.editEx&&d.ex.some(function(e){return e.id===S.ui.editEx}))||
      (S.ui.delEx&&d.ex.some(function(e){return e.id===S.ui.delEx}));
    var open=editing||S.expandDay===d.id;
    var isNext=nd&&nd.id===d.id, lastD=lastSessionForDay(d.id);
    h+='<div class="card'+(open&&isNext?' current':'')+'">';
    if(!open){
      h+='<div data-a="toggle-day" data-d="'+d.id+'" class="day-collapsed">'+
        '<div><h3>'+esc(d.name)+(isNext?' <span class="badge-next">te toca</span>':'')+'</h3>'+
        '<p>'+d.ex.length+(d.ex.length===1?' ejercicio':' ejercicios')+' · '+
        (lastD?"última vez "+daysAgoLabel(lastD.date):"todavía no la hiciste")+'</p></div>'+
        '<span class="chev">'+I_DOWN+'</span></div></div>';
      return;
    }
    if(S.ui.editDay===d.id){
      h+='<div class="frow"><input type="text" id="i-dayname" class="f2" value="'+esc(d.name)+'"></div>'+
        '<div class="actrow"><button class="btn sm" data-a="save-dayname" data-d="'+d.id+'">Guardar</button>'+
        '<button class="btn sm ghost" data-a="x-editday">Cancelar</button></div>';
    }else if(S.ui.delDay===d.id){
      h+='<div class="confirm"><span>¿Eliminar «'+esc(d.name)+'»?</span>'+
        '<button class="btn sm danger" data-a="del-day" data-d="'+d.id+'">Sí, borrar</button>'+
        '<button class="btn sm ghost" data-a="x-delday">No</button></div>';
    }else{
      h+='<div class="dhead"><h3>'+esc(d.name)+(isNext?' <span class="badge-next">te toca</span>':'')+'</h3>'+
        '<button class="ib" data-a="edit-day" data-d="'+d.id+'" aria-label="Editar nombre">'+I_EDIT+'</button>'+
        '<button class="ib danger" data-a="ask-delday" data-d="'+d.id+'" aria-label="Eliminar">'+I_TRASH+'</button>'+
        '<button class="ib" data-a="toggle-day" data-d="'+d.id+'" aria-label="Colapsar">'+I_UP+'</button></div>';
      h+='<p style="margin:2px 0 0;font-size:11.5px;color:var(--ink-faint)" class="mono">'+
        (lastD?"última vez: "+daysAgoLabel(lastD.date)+" · "+shortWk(lastD.date):"todavía no la hiciste")+'</p>';
    }
    if(!d.ex.length)h+='<p style="color:var(--ink-faint);font-size:13.5px;margin:8px 0">sin ejercicios</p>';
    d.ex.forEach(function(x,xi){
      if(S.ui.editEx===x.id){
        h+='<div class="frow" style="border-top:1px dashed var(--line);padding-top:8px">'+
          '<input type="text" id="i-exn" class="f2" value="'+esc(exName(x))+'">'+
          '<input type="text" id="i-exs" class="f1" value="'+esc(x.sets)+'" inputmode="numeric" placeholder="series">'+
          '<input type="text" id="i-exr" class="f1" value="'+esc(x.reps)+'" placeholder="reps"></div>'+
          '<div class="actrow"><button class="btn sm" data-a="save-ex" data-d="'+d.id+'" data-x="'+x.id+'">Guardar</button>'+
          '<button class="btn sm ghost" data-a="x-editex">Cancelar</button></div>';
      }else if(S.ui.delEx===x.id){
        h+='<div class="confirm"><span>¿Eliminar «'+esc(exName(x))+'»?</span>'+
          '<button class="btn sm danger" data-a="del-ex" data-d="'+d.id+'" data-x="'+x.id+'">Sí</button>'+
          '<button class="btn sm ghost" data-a="x-delex">No</button></div>';
      }else{
        h+='<div class="exrow"><span class="nm">'+esc(exName(x))+'</span>'+
          '<span class="tg">'+esc(x.sets)+'×'+esc(x.reps)+'</span><div class="exacts">'+
          (xi>0?'<button class="ib" data-a="mv-up" data-d="'+d.id+'" data-x="'+x.id+'" aria-label="Subir">'+I_UP+'</button>':'')+
          (xi<d.ex.length-1?'<button class="ib" data-a="mv-dn" data-d="'+d.id+'" data-x="'+x.id+'" aria-label="Bajar">'+I_DOWN+'</button>':'')+
          '<button class="ib" data-a="edit-ex" data-x="'+x.id+'" aria-label="Editar">'+I_EDIT+'</button>'+
          '<button class="ib danger" data-a="ask-delex" data-x="'+x.id+'" aria-label="Eliminar">'+I_TRASH+'</button></div></div>';
      }
    });
    if(S.ui.addEx===d.id){
      h+='<div class="frow" style="border-top:1px dashed var(--line);padding-top:10px">'+
        '<input type="text" id="i-nexn" class="f2" placeholder="ejercicio">'+
        '<input type="text" id="i-nexs" class="f1" value="3" inputmode="numeric" placeholder="series">'+
        '<input type="text" id="i-nexr" class="f1" value="10-12" placeholder="reps"></div>'+
        '<div class="actrow"><button class="btn sm" data-a="save-newex" data-d="'+d.id+'">Agregar</button>'+
        '<button class="btn sm ghost" data-a="x-newex">Cancelar</button></div>';
    }else{
      h+='<div style="margin-top:10px"><button class="btn ghost sm" data-a="add-ex" data-d="'+d.id+'">+ ejercicio</button></div>';
    }
    h+='</div>';
  });
  if(S.days.length){
    h+='<div class="card" style="margin-top:4px">'+
      '<div class="day-collapsed" data-a="toggle-settings">'+
      '<div style="display:flex;align-items:center;gap:8px"><span class="cfg-ico">'+I_GEAR+'</span><h3 style="font-size:15px">Configuración</h3></div>'+
      '<span class="chev">'+(S.settingsOpen?I_UP:I_DOWN)+'</span></div>';
    if(S.settingsOpen){
      h+='<div class="settings-sec"><p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 6px">'+
        'Conectado como <strong>'+esc(window.AppUserEmail||"")+'</strong>. Tu rutina e historial se sincronizan solos entre tus dispositivos.</p>'+
        '<button class="btn sm ghost" data-a="signout">Cerrar sesión</button></div>';
      h+='<div class="settings-sec"><p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 10px">'+
        '¿Cambió algo (objetivo, días, molestias)? Podés armar una rutina nueva con el cuestionario.</p>'+
        '<button class="btn sm ghost" data-a="wizard-open">Rehacer el cuestionario</button></div>';
      h+='<div class="settings-sec">'+rGrupo()+'</div>';
      h+='<div class="settings-sec"><p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 10px">'+
        'Copia de seguridad de tu rutina y tu historial — por si algún día querés pasarla a mano, o como respaldo extra además de la nube.</p>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        '<button class="btn sm ghost" data-a="export">Exportar copia</button>'+
        '<button class="btn sm ghost" data-a="import-open">Importar copia</button>'+
        '</div><input type="file" id="import-file" accept="application/json,.json" style="display:none"></div>';
      h+='<div class="settings-sec" style="text-align:center"><button class="ib" style="font-size:12px;color:var(--ink-faint);min-width:auto;padding:6px 10px" data-a="ask-reset">Borrar todos los datos</button></div>';
    }
    h+='</div>';
  }
  el("v-rutinas").innerHTML=h;
}

/* adelanto del grupo en la pestaña Hoy, para incentivar a usarlo sin
   tener que ir a buscarlo a Configuración */
function groupTeaser(){
  if(!S.groupId){
    return '<div class="card" style="margin-bottom:12px">'+
      '<p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 8px">'+
      'Comparate con amigos: racha, entrenamientos de la semana y tus mejores marcas.</p>'+
      '<button class="btn sm ghost" data-a="settings-open-group">Crear o unirme a un grupo</button></div>';
  }
  if(!S.groupBoard||!S.groupBoard.length)return '';
  var h='<div class="card" style="margin-bottom:12px">'+
    '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">'+
    '<p style="font-size:12.5px;color:var(--ink-soft);margin:0">Tu grupo</p>'+
    '<button class="linkbtn" style="font-size:12px" data-a="settings-open-group">ver todo</button></div>'+
    '<div class="group-board">';
  S.groupBoard.slice(0,3).forEach(function(m){
    h+='<div class="group-row"><div class="gr-top"><span class="gr-name">'+esc(m.name||"Alguien")+'</span>'+
      '<span class="gr-streak">'+(m.streak||0)+(m.streak===1?" semana":" semanas")+'</span></div></div>';
  });
  return h+'</div></div>';
}

function rGrupo(){
  var h='';
  if(!S.groupId){
    h+='<p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 10px">'+
      'Comparen constancia con amigos: quien crea un grupo comparte el código, y quien lo tenga se une.</p>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
      '<button class="btn sm ghost" data-a="group-create">Crear grupo</button>'+
      '<button class="btn sm ghost" data-a="group-join-open">Unirme con código</button></div>';
    if(S.ui.groupJoin){
      h+='<div class="frow" style="margin-top:10px">'+
        '<input type="text" id="i-groupcode" class="f2" placeholder="Código (ej. AB12CD)" maxlength="6" style="text-transform:uppercase"></div>'+
        '<div class="actrow"><button class="btn sm" data-a="group-join-submit">Unirme</button>'+
        '<button class="btn sm ghost" data-a="group-join-cancel">Cancelar</button></div>';
    }
  }else{
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
      '<p style="font-size:12.5px;color:var(--ink-soft);margin:0">Tu grupo</p>'+
      '<button class="ib" data-a="group-refresh" aria-label="Actualizar">'+I_REFRESH+'</button></div>'+
      '<p style="margin:0 0 12px"><span id="group-code" class="tg" style="font-size:14.5px;letter-spacing:.06em">'+esc(S.groupId)+'</span> '+
      '<button class="linkbtn" data-a="group-copy">copiar código</button></p>';
    if(S.groupBusy&&!S.groupBoard){
      h+='<p style="font-size:12.5px;color:var(--ink-faint)">cargando…</p>';
    }else if(S.groupBoard&&S.groupBoard.length){
      h+='<div class="group-board">';
      S.groupBoard.forEach(function(m){
        var lifts=[];
        if(m.bestSquat)lifts.push("sentadilla "+m.bestSquat+"kg");
        if(m.bestBench)lifts.push("banca "+m.bestBench+"kg");
        if(m.bestDeadlift)lifts.push("muerto "+m.bestDeadlift+"kg");
        if(m.weekVolume)lifts.push(m.weekVolume.toLocaleString("es-AR")+"kg esta semana");
        h+='<div class="group-row"><div class="gr-top"><span class="gr-name">'+esc(m.name||"Alguien")+'</span>'+
          '<span class="gr-streak">'+(m.streak||0)+(m.streak===1?" semana":" semanas")+' · '+(m.weekSessions||0)+' esta semana</span></div>'+
          (lifts.length?'<div class="gr-lifts">'+esc(lifts.join(" · "))+'</div>':'')+
          '</div>';
      });
      h+='</div>';
    }else{
      h+='<p style="font-size:12.5px;color:var(--ink-faint)">Todavía nadie más se unió. Compartí el código.</p>';
    }
    h+='<div style="margin-top:10px"><button class="btn sm ghost" data-a="group-leave">Salir del grupo</button></div>';
  }
  return h;
}

/* ---------- modal ---------- */
function ask(t,x,fn){el("mtitle").textContent=t;el("mtext").textContent=x;pending=fn;el("modal").classList.add("on")}
el("mno").onclick=function(){pending=null;el("modal").classList.remove("on")};
el("myes").onclick=function(){var f=pending;pending=null;el("modal").classList.remove("on");if(f)f()};

/* ---------- clicks ---------- */
document.addEventListener("click",function(ev){
  var t=ev.target.closest?ev.target.closest("[data-a]"):null;
  if(!t)return;
  var a=t.getAttribute("data-a"),d=t.getAttribute("data-d"),x=t.getAttribute("data-x"),sid=t.getAttribute("data-s");
  var day=d?S.days.filter(function(o){return o.id===d})[0]:null;

  if(a==="seed"){seed();S.expandDay=null;saveDays();render();toast("rutina cargada")}
  else if(a==="wizard-open"){
    if(!window.AppWizard)return;
    if(S.days.length){
      ask("Generar rutina nueva","Vas a reemplazar tus rutinas actuales por otras armadas según tus respuestas. Tu historial no se toca.",function(){window.AppWizard.open()});
    }else{window.AppWizard.open()}
  }
  else if(a==="upd-seed"){
    ask("Actualizar rutina","Reemplaza tus rutinas por la versión nueva: fotos en cada ejercicio, plancha 3×60seg al final de los tres días, sin pájaros ni hollow hold. Tu historial no se toca.",function(){
      seed();S.expandDay=null;S.pickDayId=null;saveDays();render();toast("rutina actualizada")});
  }
  else if(a==="open-pick"){S.pickOpen=true;render()}
  else if(a==="pick"){S.pickDayId=d;S.pickOpen=false;render()}
  else if(a==="start"){startWork()}
  else if(a==="prev"){if(S.gi>0){S.gi--;render();try{window.scrollTo(0,0)}catch(e){}}}
  else if(a==="next"){if(S.gi<S.work.ex.length-1){S.gi++;render();try{window.scrollTo(0,0)}catch(e){}}}
  else if(a==="add-set"){
    var exi=parseInt(x,10), curEx=S.work.ex[exi];
    curEx.sets.push({w:isTimeKey(curEx.key)?"0":"",r:""});
    render();saveDraft()
  }
  else if(a==="swap-open"){S.swapOpen=parseInt(x,10);render()}
  else if(a==="swap-close"){S.swapOpen=null;render()}
  else if(a==="do-swap"){
    var k=t.getAttribute("data-k"), xi=parseInt(x,10), cur=S.work.ex[xi];
    var nuevo=EXDB[k]; if(!nuevo)return;
    var prevSets=lastSetsFor(nuevo.n);
    cur.swapped=cur.swapped||cur.name;      // recordar el original
    cur.key=k; cur.name=nuevo.n;
    cur.prev=prevSets?prevSets.map(function(z){return z.w+"×"+z.r}).join("  "):null;
    cur.prevSets=prevSets||null;
    var newIsTime=isTimeKey(k);
    cur.sets.forEach(function(z){z.w=newIsTime?"0":"";z.r=""});   // los pesos del otro ejercicio no sirven
    S.swapOpen=null;render();saveDraft();
    try{window.scrollTo(0,0)}catch(e){}
  }
  else if(a==="unswap"){
    var xj=parseInt(x,10), c2=S.work.ex[xj];
    if(c2.swapped){
      var orig=c2.swapped, ok=null;
      for(var kk in EXDB){if(EXDB[kk].n===orig){ok=kk;break}}
      c2.key=ok;c2.name=orig;c2.swapped=null;
      var ps=lastSetsFor(orig);
      c2.prev=ps?ps.map(function(z){return z.w+"×"+z.r}).join("  "):null;
      c2.prevSets=ps||null;
      var origIsTime=isTimeKey(ok);
      c2.sets.forEach(function(z){z.w=origIsTime?"0":"";z.r=""});
      render();saveDraft();
    }
  }
  else if(a==="rest"){startRest(90)}
  else if(a==="finish"){finishWork()}
  else if(a==="ask-cancel"){ask("Cancelar entrenamiento","Se pierden las series que cargaste.",function(){
    S.work=null;S.workDate=null;S.pickDayId=null;S.gi=0;clearDraft();render()})}
  else if(a==="close-sum"){S.summary=null;go("historial")}
  else if(a==="toggle"){S.openS=S.openS===sid?null:sid;S.editSetsFor=null;render()}
  else if(a==="edit-exsess"){S.editSetsFor=t.getAttribute("data-hs")+"|"+t.getAttribute("data-hx");render()}
  else if(a==="x-editsess"){S.editSetsFor=null;render()}
  else if(a==="save-editsess"){
    var hSid=t.getAttribute("data-hs"), hXi=parseInt(t.getAttribute("data-hx"),10);
    var sess=S.sessions.filter(function(o){return o.id===hSid})[0];
    if(!sess||!sess.ex[hXi]){S.editSetsFor=null;render();return}
    var target=sess.ex[hXi], timeEx=isTimeKey(effKey(target));
    var rows=Array.prototype.slice.call(document.querySelectorAll("input[data-hs='"+hSid+"'][data-hx='"+hXi+"']"));
    var bySet={};
    rows.forEach(function(inp){
      var si=inp.getAttribute("data-hsi"), f=inp.getAttribute("data-f");
      bySet[si]=bySet[si]||{}; bySet[si][f]=inp.value;
    });
    var newSets=[], bad=false;
    Object.keys(bySet).sort(function(a,b){return parseInt(a)-parseInt(b)}).forEach(function(si){
      var v=bySet[si];
      if(timeEx){
        var r=parseInt(v.r,10);
        if(isNaN(r)||r<=0){bad=true;return}
        newSets.push({w:0,r:r});
      }else{
        var w=parseFloat(v.w), r2=parseInt(v.r,10);
        if(isNaN(w)||isNaN(r2)||w<0||r2<=0){bad=true;return}
        newSets.push({w:w,r:r2});
      }
    });
    if(bad||!newSets.length){toast("revisá los números cargados");return}
    target.sets=newSets;
    S.editSetsFor=null;saveSess();render();toast("actualizado");
  }
  else if(a==="ask-delsess"){S.ui={delSess:sid};render()}
  else if(a==="x-delsess"){S.ui={};render()}
  else if(a==="del-sess"){S.sessions=S.sessions.filter(function(o){return o.id!==sid});
    S.ui={};saveSess();render();toast("eliminado")}
  else if(a==="new-day"){S.ui={newDay:true};render();focus("i-day")}
  else if(a==="x-newday"){S.ui={};render()}
  else if(a==="save-day"){var n=val("i-day");if(!n){toast("ponele un nombre");return}
    var ni=uid();S.days.push({id:ni,name:n,ex:[]});S.ui={};S.expandDay=ni;saveDays();render();toast("rutina creada")}
  else if(a==="toggle-day"){S.expandDay=(S.expandDay===d?null:d);render()}
  else if(a==="toggle-settings"){S.settingsOpen=!S.settingsOpen;render()}
  else if(a==="toggle-tips"){S.showTips=!S.showTips;render()}
  else if(a==="settings-open-group"){S.settingsOpen=true;go("rutinas")}
  else if(a==="edit-day"){S.ui={editDay:d};render();focus("i-dayname")}
  else if(a==="x-editday"){S.ui={};render()}
  else if(a==="save-dayname"){var nn=val("i-dayname");if(!nn){toast("no puede quedar vacío");return}
    if(day)day.name=nn;S.ui={};saveDays();render()}
  else if(a==="ask-delday"){S.ui={delDay:d};render()}
  else if(a==="x-delday"){S.ui={};render()}
  else if(a==="del-day"){S.days=S.days.filter(function(o){return o.id!==d});
    S.expandDay=null;S.pickDayId=null;S.ui={};saveDays();render();toast("eliminada")}
  else if(a==="add-ex"){S.ui={addEx:d};render();focus("i-nexn")}
  else if(a==="x-newex"){S.ui={};render()}
  else if(a==="save-newex"){var en=val("i-nexn");if(!en){toast("ponele un nombre");return}
    if(day)day.ex.push({id:uid(),key:null,name:en,sets:val("i-nexs")||"3",reps:val("i-nexr")||"10-12"});
    S.ui={};saveDays();render()}
  else if(a==="edit-ex"){S.ui={editEx:x};render();focus("i-exn")}
  else if(a==="x-editex"){S.ui={};render()}
  else if(a==="save-ex"){var xn=val("i-exn");if(!xn){toast("no puede quedar vacío");return}
    var xo=day&&day.ex.filter(function(o){return o.id===x})[0];
    if(xo){if(xn!==exName(xo)){xo.key=null;xo.name=xn}xo.sets=val("i-exs")||"3";xo.reps=val("i-exr")||"10"}
    S.ui={};saveDays();render()}
  else if(a==="ask-delex"){S.ui={delEx:x};render()}
  else if(a==="x-delex"){S.ui={};render()}
  else if(a==="del-ex"){if(day)day.ex=day.ex.filter(function(o){return o.id!==x});S.ui={};saveDays();render()}
  else if(a==="mv-up"||a==="mv-dn"){if(day){var i=-1;
    for(var k=0;k<day.ex.length;k++)if(day.ex[k].id===x)i=k;
    var j=a==="mv-up"?i-1:i+1;
    if(i>-1&&j>-1&&j<day.ex.length){var tm=day.ex[i];day.ex[i]=day.ex[j];day.ex[j]=tm;saveDays();render()}}}
  else if(a==="export"){if(exportBackup())toast("copia descargada")}
  else if(a==="import-open"){var fi=el("import-file");if(fi)fi.click()}
  else if(a==="signout"){firebase.auth().signOut().then(function(){location.reload()})}
  else if(a==="ask-reset"){ask("Borrar todos los datos","Se elimina tu rutina y todo el historial de este teléfono y de tu cuenta en la nube. No se puede deshacer.",function(){
    S.days=[];S.sessions=[];S.work=null;S.summary=null;S.ui={};S.expandDay=null;
    saveDays();saveSess();clearDraft();render();toast("datos borrados")})}
  else if(a==="group-create"){setGroup(genCode());toast("grupo creado")}
  else if(a==="group-join-open"){S.ui={groupJoin:true};render();focus("i-groupcode")}
  else if(a==="group-join-cancel"){S.ui={};render()}
  else if(a==="group-join-submit"){
    var code=val("i-groupcode").toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(!code){toast("escribí un código");return}
    S.ui={};setGroup(code);toast("te uniste al grupo")}
  else if(a==="group-refresh"){refreshBoard()}
  else if(a==="group-copy"){
    try{navigator.clipboard.writeText(S.groupId).then(function(){toast("código copiado")})}
    catch(e){toast("tu código es "+S.groupId)}}
  else if(a==="group-leave"){ask("Salir del grupo","Dejás de ver y de compartir tus estadísticas con este grupo. Podés volver a unirte con el mismo código.",function(){
    leaveGroup();toast("saliste del grupo")})}
},false);

document.addEventListener("input",function(ev){
  var i=ev.target;
  if(i.getAttribute&&i.getAttribute("data-hs")!=null)return; // campo de edición de historial: no toca el entrenamiento en curso
  if(!i.getAttribute||!i.getAttribute("data-f")||!S.work)return;
  var xi=parseInt(i.getAttribute("data-x"),10),si=parseInt(i.getAttribute("data-s"),10),f=i.getAttribute("data-f");
  var st=S.work.ex[xi].sets[si];st[f]=i.value;
  var curEx2=S.work.ex[xi];
  var full=isTimeKey(curEx2.key)?(st.r!==""):(st.w!==""&&st.r!=="");
  var row=i.parentNode;if(row&&row.classList)row.classList.toggle("ok",full);
  saveDraft();
},false);
document.addEventListener("change",function(ev){
  if(ev.target&&ev.target.id==="i-workdate"){S.workDate=ev.target.value;render();return}
  if(ev.target&&ev.target.id==="import-file"){
    var file=ev.target.files&&ev.target.files[0];
    ev.target.value="";
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(){
      var obj;
      try{obj=JSON.parse(reader.result)}catch(e){toast("el archivo no es un JSON válido");return}
      if(!validBackup(obj)){toast("ese archivo no es una copia de seguridad válida");return}
      ask("Importar copia de seguridad","Reemplaza tu rutina y todo tu historial actual por los del archivo. No se puede deshacer.",function(){
        applyImportedData(obj);
      });
    };
    reader.onerror=function(){toast("no se pudo leer el archivo")};
    reader.readAsText(file);
  }
},false);

function val(id){var e=el(id);return e?e.value.trim():""}
function focus(id){setTimeout(function(){var e=el(id);if(e)e.focus()},40)}
function exportBackup(){
  var payload={app:"mirutina",version:1,exportedAt:new Date().toISOString(),days:S.days,sessions:S.sessions};
  try{
    var blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");
    a.href=url;a.download="mirutina-backup-"+localDateStr()+".json";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url)},2000);
    return true;
  }catch(e){toast("no se pudo generar el archivo");return false}
}
function validBackup(obj){
  return obj&&Array.isArray(obj.days)&&Array.isArray(obj.sessions)&&
    obj.days.every(function(d){return d&&typeof d.id==="string"&&typeof d.name==="string"&&Array.isArray(d.ex)})&&
    obj.sessions.every(function(s){return s&&typeof s.id==="string"&&typeof s.date==="string"&&Array.isArray(s.ex)});
}
function applyImportedData(obj){
  if(!validBackup(obj)){toast("ese archivo no es una copia de seguridad válida");return false}
  S.days=obj.days;S.sessions=obj.sessions;
  S.work=null;S.summary=null;S.ui={};S.expandDay=null;S.pickDayId=null;S.workDate=null;S.gi=0;S.swapOpen=null;
  saveDays();saveSess();clearDraft();
  render();toast("copia de seguridad importada");
  return true;
}
function applyGeneratedDays(days){
  S.days=days;
  S.work=null;S.summary=null;S.ui={};S.expandDay=null;S.pickDayId=null;S.workDate=null;S.gi=0;S.swapOpen=null;
  saveDays();clearDraft();render();
}
function seed(){S.days=SEED.map(function(d){
  return{id:uid(),name:d.name,ex:d.ex.map(function(a){
    return{id:uid(),key:a[0],name:(EXDB[a[0]]?EXDB[a[0]].n:a[0]),sets:String(a[1]),reps:a[2]}})}})}

var tabs=document.querySelectorAll(".tab");
for(var ti=0;ti<tabs.length;ti++)(function(b){b.onclick=function(){go(b.getAttribute("data-tab"))}})(tabs[ti]);

/* ---------- cronómetro ---------- */
var CIRC=2*Math.PI*44;
function tui(){
  el("tlab").textContent=mmss(S.timer.left);
  var r=el("ring"),f=S.timer.total?S.timer.left/S.timer.total:0;
  r.setAttribute("stroke-dasharray",CIRC);r.setAttribute("stroke-dashoffset",String(CIRC*(1-f)));
  el("tgo").textContent=S.timer.run?"Pausar":"Iniciar";
  var ps=document.querySelectorAll(".preset");
  for(var k=0;k<ps.length;k++)ps[k].classList.toggle("on",parseInt(ps[k].getAttribute("data-secs"),10)===S.timer.total);
}
function beep(){
  try{var C=window.AudioContext||window.webkitAudioContext;if(C){
    var c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;
    o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.18,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.6);o.start();o.stop(c.currentTime+.6)}}catch(e){}
  if(navigator.vibrate)try{navigator.vibrate([180,90,180])}catch(e){}
}
/* se calcula contra la hora real de fin: si se apaga la pantalla o el
   sistema frena el temporizador, al volver muestra el tiempo correcto */
function tick(){
  var rem=Math.round((S.timer.endAt-Date.now())/1000);
  if(rem<=0){S.timer.left=0;clearInterval(S.timer.iv);S.timer.run=false;beep();tui();return}
  S.timer.left=rem;tui();
}
function startRest(secs){
  clearInterval(S.timer.iv);
  S.timer.total=secs;S.timer.left=secs;S.timer.run=true;
  S.timer.endAt=Date.now()+secs*1000;
  S.timer.iv=setInterval(tick,250);
  el("tpanel").classList.add("on");tui();
}
var presets=document.querySelectorAll(".preset");
for(var pi=0;pi<presets.length;pi++)(function(b){b.onclick=function(){
  clearInterval(S.timer.iv);var s=parseInt(b.getAttribute("data-secs"),10);
  S.timer.total=s;S.timer.left=s;S.timer.run=false;S.timer.endAt=0;tui()}})(presets[pi]);
el("tgo").onclick=function(){
  if(S.timer.run){clearInterval(S.timer.iv);S.timer.run=false}
  else{if(S.timer.left<=0)S.timer.left=S.timer.total;
    S.timer.endAt=Date.now()+S.timer.left*1000;S.timer.run=true;S.timer.iv=setInterval(tick,250)}
  tui()};
el("trs").onclick=function(){clearInterval(S.timer.iv);S.timer.run=false;S.timer.left=S.timer.total;S.timer.endAt=0;tui()};
el("fab").onclick=function(){el("tpanel").classList.toggle("on")};

/* ---------- arranque ---------- */
function boot(cloudHadData){
  Promise.all([Store.get("gym-days"),Store.get("gym-sessions"),Store.get("gym-draft")]).then(function(r){
    if(!cloudHadData){
      S.days=Array.isArray(r[0])?r[0]:[];
      S.sessions=Array.isArray(r[1])?r[1]:[];
    }
    if(!S.days.length){
      if(window.AppWizard)window.AppWizard.open();
      else{seed();saveDays()}
    }
    var restored=false,dr=r[2];
    if(dr&&dr.ex&&dr.ex.length&&dr.savedAt){
      var age=Date.now()-new Date(dr.savedAt).getTime();
      if(age>=0&&age<DRAFT_MAX_AGE){
        S.work={dayId:dr.dayId,dayName:dr.dayName,date:dr.date||dr.savedAt,ex:dr.ex};
        S.gi=typeof dr.gi==="number"?dr.gi:0;restored=true;
      }else clearDraft();
    }
    tui();go("hoy");
    if(restored)toast("recuperamos tu entrenamiento sin terminar");
  }).catch(function(){S.days=[];S.sessions=[];seed();tui();go("hoy")});
}
document.addEventListener("visibilitychange",function(){
  if(!document.hidden&&S.timer.run)tick();
},false);

/* el arranque real lo dispara auth.js una vez que hay sesión iniciada.
   se espera la respuesta de la nube antes de arrancar: así, en un
   dispositivo nuevo con la misma cuenta, no se confunde "todavía no
   llegó la rutina real" con "usuario nuevo" y no se pisa nada. */
window.AppCloud={
  start:function(uid){
    detachCloud();
    el("v-hoy").innerHTML='<p style="text-align:center;color:var(--ink-soft);padding:30px">cargando…</p>';
    el("v-hoy").classList.add("on");
    attachCloud(uid).then(boot);
  },
  stop:function(){detachCloud()}
};
window.AppRoutines={apply:applyGeneratedDays};
})();

