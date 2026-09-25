# Taros-fit (Mi Rutina)

Tracker de gimnasio: rutinas A/B/C, modo guiado con fotos y técnica de cada
ejercicio, historial, progreso y cronómetro de descanso. Corre con cuenta
propia, así que el historial se ve igual desde el celu y desde la compu.

Sin build step: es HTML/CSS/JS puro, se despliega tal cual como sitio estático.

## 1. Crear el proyecto de Firebase (una sola vez, ~5 min)

1. Andá a [console.firebase.google.com](https://console.firebase.google.com) y creá un proyecto nuevo (el nombre no importa, ej. "taros-fit").
2. En el menú izquierdo → **Build → Authentication → Get started**.
   - Pestaña "Sign-in method" → habilitá **Email/Password**.
3. En el menú izquierdo → **Build → Firestore Database → Create database**.
   - Elegí **modo producción** (no "modo de prueba") y la región que quieras.
4. Reglas de seguridad: pestaña **Rules** de Firestore, reemplazá todo por esto y publicá:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

   Esto hace que cada usuario solo pueda leer/escribir su propio documento — nadie
   puede ver el entrenamiento de nadie más, aunque las claves del paso 5 sean públicas.

5. En el menú izquierdo → **⚙️ Project settings** (el engranaje) → abajo del todo,
   en "Your apps" → click en el ícono `</>` (Web) → registrá una app (el nombre
   no importa) → te va a mostrar un objeto `firebaseConfig`. Copiá esos valores
   a `js/firebase-config.js` en este repo, reemplazando los `"TU_..."`.

Con eso ya está: creás una cuenta desde la pantalla de login de la app (con
cualquier email/contraseña, no hace falta que sea un mail real que verifiques)
y funciona desde cualquier dispositivo donde entres con esa misma cuenta.

## 2. Desplegar

Es un sitio estático, así que cualquiera de estas sirve:

- **Netlify**: arrastrá la carpeta a [app.netlify.com/drop](https://app.netlify.com/drop), o conectá este repo de GitHub para que se redeploye solo con cada push.
- **GitHub Pages**: Settings → Pages → Deploy from branch → `main` / `/ (root)`.
- **Vercel**: importá el repo, sin configuración adicional (no hay build command).

## Estructura

```
index.html          pantalla de login + shell de la app
css/style.css        estilos (incluye modo oscuro automático)
js/exercises.js       biblioteca de ejercicios (técnica, errores comunes, fotos)
js/app.js             lógica de la app (rutinas, entrenamiento guiado, historial, progreso)
js/auth.js            login/registro y arranque tras autenticarse
js/firebase-config.js  tus claves de Firebase (completar, no son secretas)
img/                  fotos de cada ejercicio
manifest.json, sw.js   PWA: se puede "agregar a inicio" y funciona offline en el gym
```

## Cómo sincroniza

- Cada entrenamiento y cada cambio a tus rutinas se guarda primero en el
  celular (`localStorage`), así que en el gym sin señal sigue andando normal.
- En cuanto hay conexión, se sube a Firestore bajo tu usuario. Al entrar desde
  otro dispositivo con la misma cuenta, se descarga esa misma información.
- El entrenamiento que tenés a medias (sin terminar) es local a cada
  dispositivo — no se sincroniza hasta que le das "Finalizar".
