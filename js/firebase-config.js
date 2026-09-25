/* Config de tu proyecto de Firebase.
   La sacás de: Firebase Console → ⚙️ Configuración del proyecto → tus apps → app web → "Config".
   No es secreta: es normal que viva en el código del frontend. La seguridad real
   la dan las reglas de Firestore (ver README.md). */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDc0dAc71yD_Br37Cu6eADzgfsvb0-7PGM",
  authDomain: "tarosfit.firebaseapp.com",
  projectId: "tarosfit",
  storageBucket: "tarosfit.firebasestorage.app",
  messagingSenderId: "863309098220",
  appId: "1:863309098220:web:b0773b5c25c7fa77c5c9c9"
};

window.FIREBASE_CONFIGURED = window.FIREBASE_CONFIG.apiKey !== "TU_API_KEY";

if (window.FIREBASE_CONFIGURED && window.firebase) {
  firebase.initializeApp(window.FIREBASE_CONFIG);
}
