(function(){
"use strict";
function el(id){return document.getElementById(id)}

if(!window.firebase || !window.FIREBASE_CONFIGURED){
  var msg=el("auth-msg");
  if(msg)msg.textContent="Falta configurar Firebase (js/firebase-config.js). Mirá el README.";
  return;
}

try{ firebase.firestore().enablePersistence({synchronizeTabs:true}).catch(function(){}); }catch(e){}

var mode="login";

function setMsg(t,isErr){
  var m=el("auth-msg");
  if(!m)return;
  m.textContent=t||"";
  m.style.color=isErr?"var(--rust)":"var(--ink-soft)";
}

function errText(e){
  var map={
    "auth/wrong-password":"Contraseña incorrecta.",
    "auth/user-not-found":"No existe una cuenta con ese email.",
    "auth/email-already-in-use":"Ya existe una cuenta con ese email.",
    "auth/weak-password":"La contraseña necesita al menos 6 caracteres.",
    "auth/invalid-email":"Ese email no es válido.",
    "auth/too-many-requests":"Demasiados intentos. Probá de nuevo en un rato."
  };
  return (e&&map[e.code])||"Algo salió mal, probá de nuevo.";
}

el("auth-toggle").onclick=function(){
  mode=mode==="login"?"signup":"login";
  el("auth-submit").textContent=mode==="login"?"Entrar":"Crear cuenta";
  el("auth-toggle").textContent=mode==="login"?"¿No tenés cuenta? Creá una":"¿Ya tenés cuenta? Entrá";
  setMsg("");
};

el("auth-forgot").onclick=function(){
  var email=el("auth-email").value.trim();
  if(!email){setMsg("Escribí tu email arriba primero.",true);return}
  firebase.auth().sendPasswordResetEmail(email).then(function(){
    setMsg("Te mandamos un mail para resetear la contraseña.");
  }).catch(function(e){setMsg(errText(e),true)});
};

el("auth-form").onsubmit=function(ev){
  ev.preventDefault();
  var email=el("auth-email").value.trim();
  var pass=el("auth-pass").value;
  if(!email||!pass){setMsg("Completá email y contraseña.",true);return}
  el("auth-submit").disabled=true;
  setMsg("");
  var p=mode==="login"
    ? firebase.auth().signInWithEmailAndPassword(email,pass)
    : firebase.auth().createUserWithEmailAndPassword(email,pass);
  p.catch(function(e){setMsg(errText(e),true)})
   .then(function(){el("auth-submit").disabled=false});
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
    el("auth-email").value="";
    el("auth-pass").value="";
  }
});
})();
