(function(){
"use strict";
function el(id){return document.getElementById(id)}

if(!window.firebase || !window.FIREBASE_CONFIGURED){
  var msg=el("auth-msg");
  if(msg)msg.textContent="Falta configurar Firebase (js/firebase-config.js). Mirá el README.";
  return;
}

try{ firebase.firestore().enablePersistence({synchronizeTabs:true}).catch(function(){}); }catch(e){}

function setMsg(t,isErr){
  var m=el("auth-msg");
  if(!m)return;
  m.textContent=t||"";
  m.style.color=isErr?"var(--rust)":"var(--ink-soft)";
}

function errText(e){
  if(!e)return "Algo salió mal, probá de nuevo.";
  var map={
    "auth/popup-closed-by-user":"",
    "auth/cancelled-popup-request":"",
    "auth/popup-blocked":"El navegador bloqueó la ventana de Google. Habilitá popups e intentá de nuevo.",
    "auth/network-request-failed":"Sin conexión. Probá de nuevo cuando tengas señal."
  };
  return map[e.code]!==undefined?map[e.code]:"Algo salió mal, probá de nuevo.";
}

el("auth-google").onclick=function(){
  el("auth-google").disabled=true;
  setMsg("");
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .catch(function(e){setMsg(errText(e),true)})
    .then(function(){el("auth-google").disabled=false});
};

firebase.auth().onAuthStateChanged(function(user){
  if(user){
    window.AppUserEmail=user.email||"";
    el("auth-screen").classList.add("hidden");
    el("app-root").classList.remove("hidden");
    if(window.AppCloud)window.AppCloud.start(user.uid);
  }else{
    if(window.AppCloud)window.AppCloud.stop();
    el("app-root").classList.add("hidden");
    el("auth-screen").classList.remove("hidden");
  }
});
})();
