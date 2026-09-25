/* Config de tu proyecto de Firebase.
   La sacás de: Firebase Console → ⚙️ Configuración del proyecto → tus apps → app web → "Config".
   No es secreta: es normal que viva en el código del frontend. La seguridad real
   la dan las reglas de Firestore (ver README.md). */
window.FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

window.FIREBASE_CONFIGURED = window.FIREBASE_CONFIG.apiKey !== "TU_API_KEY";

if (window.FIREBASE_CONFIGURED && window.firebase) {
  firebase.initializeApp(window.FIREBASE_CONFIG);
}
