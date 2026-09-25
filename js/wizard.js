/* Cuestionario para armar una rutina a medida a partir del catálogo de
   ejercicios (EXDB/GRUPOS de exercises.js). Todo por cálculo, sin IA:
   las respuestas eligen un tipo de split, un volumen de series/reps, qué
   grupo reforzar y qué ejercicios de riesgo evitar; el resto sale de
   listas fijas. */
(function(){
"use strict";
function el(id){return document.getElementById(id)}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
var I_SWAP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>';
function toast(m){var t=el("toast");if(!t)return;t.textContent=m;t.classList.add("on");
  clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove("on")},2100)}

/* ---------- catálogo: grupos y orden de preferencia dentro de cada uno
   (compuestos primero, así cuando un día pide un solo ejercicio del grupo
   cae el más importante) ---------- */
var GROUPS=["cuadriceps","isquios","pecho","espalda","hombro","brazos","gemelos","core"];
var UPPER=["pecho","espalda","hombro","brazos"];
var LOWER=["cuadriceps","isquios","gemelos","core"];
var ALL=9; // más que el máximo posible por grupo: "tomá todos los que haya"

var PRIORITY={
  cuadriceps:["sentadilla","prensa","zancadas","bulgara","extension-cuadriceps"],
  isquios:["peso-muerto","peso-muerto-rumano","hip-thrust","curl-femoral","curl-femoral-sentado"],
  pecho:["press-banca","press-inclinado","press-mancuernas","fondos","aperturas"],
  espalda:["remo-barra","jalon","dominadas","remo-mancuerna","remo-polea"],
  hombro:["press-militar","press-hombro-mancuernas","elevaciones-laterales","face-pull","encogimientos"],
  brazos:["curl-biceps","curl-martillo","triceps-polea","press-frances"],
  gemelos:["gemelos","gemelos-sentado"],
  core:["plancha","abdominales","rueda-abdominal"]
};

/* qué grupos entran cuando el usuario elige reforzar uno en particular */
var FOCUS_MAP={pecho:["pecho"],espalda:["espalda"],piernas:["cuadriceps","isquios"],hombro:["hombro"],brazos:["brazos"]};
function focusGroups(ans){return FOCUS_MAP[ans.focus]||[]}

/* ejercicios a evitar según cada molestia, dejando siempre alternativas
   del mismo grupo. Esto no reemplaza el consejo de un profesional: solo
   baja el riesgo saltando la variante más exigente para esa zona. */
var CARE={
  rodillas:["bulgara","zancadas","sentadilla"],
  espalda:["peso-muerto","peso-muerto-rumano","remo-barra","sentadilla"],
  hombros:["press-militar","fondos"]
};

function poolFor(group,limits){
  var excl=[];
  limits.forEach(function(l){(CARE[l]||[]).forEach(function(k){excl.push(k)})});
  var order=(PRIORITY[group]||[]).filter(function(k){return EXDB[k]});
  var pool=order.filter(function(k){return excl.indexOf(k)===-1});
  return pool.length?pool:order;
}

function setsRepsFor(goal,level){
  var base={hipertrofia:{sets:3,reps:"8-12"},fuerza:{sets:4,reps:"5-6"},salud:{sets:3,reps:"12-15"}}[goal]||
    {sets:3,reps:"10-12"};
  var sets=base.sets;
  if(level==="principiante")sets=Math.max(2,sets-1);
  if(level==="avanzado")sets=sets+1;
  return{sets:sets,reps:base.reps};
}

function mkEx(key,sr){
  return{id:uid(),key:key,name:EXDB[key].n,sets:String(sr.sets),
    reps:EXDB[key].unit==="time"?"60 seg":sr.reps};
}

/* suma +1 ejercicio a los grupos de "focus" dentro de un mapa de cantidades
   por grupo (respeta el "_" como valor por defecto de los que no se listan) */
function bump(base,groups,focus){
  var o={};
  groups.forEach(function(g){o[g]=(base[g]||base._||1)+(focus.indexOf(g)>-1?1:0)});
  return o;
}

/* un ejercicio por grupo (dos si el grupo está en "focus"), con "offset"
   para variar entre días */
function fullBodyDay(name,limits,offset,sr,focus){
  var ex=[];
  GROUPS.forEach(function(g){
    var pool=poolFor(g,limits);
    if(!pool.length)return;
    var n=focus.indexOf(g)>-1?2:1;
    for(var i=0;i<n&&i<pool.length;i++)ex.push(mkEx(pool[(offset+i)%pool.length],sr));
  });
  return{id:uid(),name:name,ex:ex};
}

/* varios ejercicios de los grupos indicados: para superior/inferior o
   para un día de un solo grupo grande (split por partes) */
function partDay(name,groups,limits,offset,sr,perGroup){
  var ex=[];
  groups.forEach(function(g){
    var pool=poolFor(g,limits);
    var n=Math.min(pool.length,(perGroup&&(perGroup[g]||perGroup._))||1);
    for(var i=0;i<n;i++)ex.push(mkEx(pool[(offset+i)%pool.length],sr));
  });
  return{id:uid(),name:name,ex:ex};
}

function buildRoutine(ans){
  var sr=setsRepsFor(ans.goal,ans.level),lim=ans.limits||[],focus=focusGroups(ans);
  if(ans.days===2)return[
    fullBodyDay("Rutina A",lim,0,sr,focus),
    fullBodyDay("Rutina B",lim,1,sr,focus)
  ];
  if(ans.days===4)return[
    partDay("Superior A",UPPER,lim,0,sr,bump({_:1},UPPER,focus)),
    partDay("Inferior A",LOWER,lim,0,sr,bump({_:1},LOWER,focus)),
    partDay("Superior B",UPPER,lim,1,sr,bump({_:1},UPPER,focus)),
    partDay("Inferior B",LOWER,lim,1,sr,bump({_:1},LOWER,focus))
  ];
  if(ans.days===5)return[
    partDay("Pecho",["pecho"],lim,0,sr,bump({_:ALL},["pecho"],focus)),
    partDay("Espalda",["espalda"],lim,0,sr,bump({_:ALL},["espalda"],focus)),
    partDay("Piernas",["cuadriceps","isquios","gemelos"],lim,0,sr,
      bump({cuadriceps:3,isquios:2,gemelos:2},["cuadriceps","isquios","gemelos"],focus)),
    partDay("Hombros y core",["hombro","core"],lim,0,sr,bump({hombro:4,core:2},["hombro","core"],focus)),
    partDay("Brazos y core",["brazos","core"],lim,1,sr,bump({brazos:ALL,core:2},["brazos","core"],focus))
  ];
  return[ // 3 días, o cualquier otro valor: cuerpo completo clásico
    fullBodyDay("Rutina A",lim,0,sr,focus),
    fullBodyDay("Rutina B",lim,1,sr,focus),
    fullBodyDay("Rutina C",lim,2,sr,focus)
  ];
}

/* ---------- preguntas ---------- */
var STEPS=[
 {key:"goal",type:"single",q:"¿Cuál es tu objetivo principal?",
  opts:[
   {v:"hipertrofia",l:"Ganar músculo",d:"Más series, de 8 a 12 repeticiones"},
   {v:"fuerza",l:"Ganar fuerza",d:"Pesos más altos, series cortas de 5 a 6"},
   {v:"salud",l:"Salud y tonificar",d:"Series más largas, esfuerzo moderado"}
  ]},
 {key:"level",type:"single",q:"¿Cuánta experiencia tenés entrenando?",
  opts:[
   {v:"principiante",l:"Principiante",d:"Recién arranco o llevo menos de 6 meses"},
   {v:"intermedio",l:"Intermedio",d:"Entre 6 meses y 2 años"},
   {v:"avanzado",l:"Avanzado",d:"Más de 2 años entrenando"}
  ]},
 {key:"days",type:"single",q:"¿Cuántos días por semana podés entrenar?",
  opts:[
   {v:2,l:"2 días",d:"Cuerpo completo, 2 veces por semana"},
   {v:3,l:"3 días",d:"Cuerpo completo — la rutina clásica"},
   {v:4,l:"4 días",d:"Tren superior e inferior alternados"},
   {v:5,l:"5 días",d:"Un grupo muscular grande por día"}
  ]},
 {key:"focus",type:"single",q:"¿Querés darle prioridad a algún grupo en particular?",
  note:"Le suma trabajo extra a ese grupo durante la semana.",
  opts:[
   {v:"ninguno",l:"Ninguno en particular"},
   {v:"pecho",l:"Pecho"},
   {v:"espalda",l:"Espalda"},
   {v:"piernas",l:"Piernas"},
   {v:"hombro",l:"Hombros"},
   {v:"brazos",l:"Brazos"}
  ]},
 {key:"limits",type:"multi",q:"¿Alguna molestia que debamos tener en cuenta?",
  note:"No reemplaza el consejo de un profesional: solo evita el ejercicio de más riesgo para esa zona.",
  opts:[
   {v:"rodillas",l:"Rodillas"},
   {v:"espalda",l:"Espalda baja"},
   {v:"hombros",l:"Hombros"}
  ]}
];

var GEN_STEPS=["Elegimos el tipo de rutina","Calculamos series y repeticiones","Elegimos los ejercicios"];
var GEN_MS=1150;

var ans,idx,draft;
function reset(){ans={goal:null,level:null,days:null,focus:null,limits:[]};idx=0;draft=null}

function labelFor(stepKey,v){
  var st=STEPS.filter(function(s){return s.key===stepKey})[0];
  var o=st&&st.opts.filter(function(o){return o.v===v})[0];
  return o?o.l:v;
}

function summaryLine(){
  var bits=[labelFor("goal",ans.goal)+", nivel "+labelFor("level",ans.level).toLowerCase(),
    ans.days+" días por semana"];
  if(ans.focus&&ans.focus!=="ninguno")bits.push("prioridad en "+labelFor("focus",ans.focus).toLowerCase());
  if(ans.limits.length)bits.push("sin ejercicios de riesgo para "+ans.limits.map(function(l){return labelFor("limits",l).toLowerCase()}).join(" y "));
  return bits.join(" · ");
}

function dots(total,cur){
  var h="";
  for(var i=0;i<total;i++)h+='<span class="wiz-dot'+(i===cur?" on":"")+'"></span>';
  return h;
}

function render(){
  var root=el("wizard-screen");
  if(!root)return;
  var h='<div class="wiz-wrap wiz-step">';
  if(idx<STEPS.length){
    var st=STEPS[idx];
    h+='<div class="wiz-dots">'+dots(STEPS.length+1,idx)+'</div>';
    if(idx===0)h+='<h1>Armemos tu rutina</h1><p class="tag">Unas preguntas rápidas para adaptarla a vos.</p>';
    h+='<p class="wiz-q">'+esc(st.q)+'</p>';
    if(st.note)h+='<p class="wiz-note">'+esc(st.note)+'</p>';
    h+='<div class="wiz-opts">';
    st.opts.forEach(function(o){
      var on=st.type==="multi"?ans.limits.indexOf(o.v)>-1:ans[st.key]===o.v;
      h+='<button class="chip'+(on?" on":"")+'" data-w="opt" data-k="'+st.key+'" data-t="'+st.type+'" data-v="'+esc(String(o.v))+'">'+
        esc(o.l)+(o.d?'<span class="d">'+esc(o.d)+'</span>':'')+'</button>';
    });
    h+='</div><div class="wiz-nav">'+
      (idx>0?'<button class="btn ghost sm" data-w="back">← Atrás</button>':'<span></span>')+
      (st.type==="multi"?'<button class="btn sm" data-w="next">Continuar</button>':'<span></span>')+
      '</div>';
    if(idx===0)h+='<button type="button" class="wiz-skip" data-w="skip">Prefiero la rutina clásica de 3 días</button>';
  }else{
    if(!draft)draft=buildRoutine(ans);
    h+='<div class="wiz-dots">'+dots(STEPS.length+1,idx)+'</div>'+
      '<p class="wiz-q">Tu rutina va a quedar así</p>'+
      '<p class="wiz-note">'+esc(summaryLine())+'</p>';
    draft.forEach(function(d,di){
      h+='<div class="card" style="margin-bottom:10px"><h4 class="wiz-day">'+esc(d.name)+'</h4>';
      d.ex.forEach(function(x,xi){
        h+='<div class="exrow"><span class="nm">'+esc(x.name)+'</span>'+
          '<span class="tg">'+esc(x.sets)+'×'+esc(x.reps)+'</span>'+
          '<button class="ib" data-w="swap-ex" data-day="'+di+'" data-idx="'+xi+'" aria-label="Cambiar ejercicio">'+I_SWAP+'</button></div>';
      });
      h+='</div>';
    });
    h+='<p class="wiz-note">Tocá el ícono al lado de un ejercicio para cambiarlo por otro del mismo grupo.</p>'+
      '<div class="wiz-nav">'+
      '<button class="btn ghost sm" data-w="back">← Atrás</button>'+
      '<button class="btn sm" data-w="gen">Generar mi rutina</button>'+
      '</div>';
  }
  h+='</div>';
  root.innerHTML=h;
}

function renderGenerating(){
  var root=el("wizard-screen");
  if(!root)return;
  var h='<div class="wiz-wrap wiz-generating"><div class="wiz-spinner"></div>'+
    '<p class="wiz-q">Armando tu rutina…</p><ul class="wiz-steps-anim">';
  GEN_STEPS.forEach(function(s,i){
    h+='<li style="animation-delay:'+(i*.3).toFixed(2)+'s">'+esc(s)+'</li>';
  });
  h+='</ul></div>';
  root.innerHTML=h;
}

function applyDays(days){
  renderGenerating();
  setTimeout(function(){
    if(window.AppRoutines)window.AppRoutines.apply(days);
    close();
    toast("rutina generada");
  },GEN_MS);
}
function finish(a){applyDays(buildRoutine(a))}
function close(){var r=el("wizard-screen");if(r)r.classList.add("hidden")}

document.addEventListener("click",function(ev){
  var t=ev.target.closest?ev.target.closest("[data-w]"):null;
  if(!t)return;
  var w=t.getAttribute("data-w");
  if(w==="opt"){
    var k=t.getAttribute("data-k"),type=t.getAttribute("data-t"),raw=t.getAttribute("data-v");
    var v=k==="days"?parseInt(raw,10):raw;
    if(type==="multi"){
      var i=ans.limits.indexOf(v);
      if(i>-1)ans.limits.splice(i,1);else ans.limits.push(v);
      render();
    }else{ans[k]=v;idx++;draft=null;render()}
  }else if(w==="back"){idx=Math.max(0,idx-1);draft=null;render()}
  else if(w==="next"){idx++;draft=null;render()}
  else if(w==="swap-ex"){
    var di=parseInt(t.getAttribute("data-day"),10),xi=parseInt(t.getAttribute("data-idx"),10);
    var day=draft[di],x=day.ex[xi];
    var usedInDay=day.ex.map(function(e){return e.key});
    var opts=alternativas(x.key).filter(function(k){return usedInDay.indexOf(k)===-1});
    var lim=ans.limits||[];
    var excl=[];lim.forEach(function(l){(CARE[l]||[]).forEach(function(k){excl.push(k)})});
    var safe=opts.filter(function(k){return excl.indexOf(k)===-1});
    var pool=safe.length?safe:opts;
    if(pool.length){
      var next=pool[Math.floor(Math.random()*pool.length)];
      x.key=next;x.name=EXDB[next].n;
      if(EXDB[next].unit==="time")x.reps="60 seg";
      render();
    }else toast("no hay otro ejercicio de ese grupo para elegir");
  }
  else if(w==="skip"){finish({goal:"hipertrofia",level:"intermedio",days:3,focus:"ninguno",limits:[]})}
  else if(w==="gen"){applyDays(draft||buildRoutine(ans))}
});

window.AppWizard={
  open:function(){reset();var r=el("wizard-screen");if(!r)return;r.classList.remove("hidden");render()}
};
})();
