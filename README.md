# Quiniela familiar 2026/2027

Aplicación web mobile-first para gestionar una quiniela familiar con React, Vite, Firebase Auth, Firestore, Hosting y Cloud Functions.

## Funciones incluidas
- Login sencillo con Firebase Auth anónimo y perfil en Firestore.
- Jornada activa con 14 partidos, botones grandes 1/X/2 y Pleno al 15.
- Panel admin para crear/editar jornada, partidos, resultados, estado, copita y recalcular.
- Clasificación individual y por equipos en tarjetas móviles.
- Tablas previas con formulario base y reglas de puntuación implementadas en `src/services/scoring.js`.
- Reglas Firestore para admin, participantes, visibilidad de pronósticos y bloqueo tras fecha límite.
- Function callable para generar quinielas aleatorias de ausentes con penalización marcada.
- Datos mock iniciales para probar sin Firebase.

## Probar en Visual Studio Code

### 1. Requisitos
Instala en tu ordenador:
- Node.js 20 o superior.
- Visual Studio Code.
- Extensión recomendada: **ESLint** y **Firebase Explorer** si quieres ver recursos de Firebase desde VS Code.
- Firebase CLI si vas a desplegar o usar emuladores:

```bash
npm install -g firebase-tools
```

### 2. Abrir y arrancar la app
En VS Code:
1. Abre la carpeta del proyecto.
2. Abre una terminal integrada.
3. Instala dependencias y arranca Vite:

```bash
npm install
cp .env.example .env
npm run dev
```

Vite mostrará una URL tipo `http://localhost:5173`. Ábrela en el navegador. Para probar en móvil real, usa la URL de red que enseña Vite, normalmente parecida a `http://192.168.x.x:5173`, con el móvil conectado al mismo Wi-Fi.

> Nota: la app incluye datos mock para poder ver pantallas aunque todavía no hayas creado documentos reales en Firestore.


## ¿Qué pongo en la pantalla de entrada?

La pantalla inicial usa usuario y contraseña sencillos:

- **Administrador:** usuario `admin` y contraseña `admin`.
- **Participantes:** pulsa **Registrarme**, elige un usuario, un nombre visible y una contraseña.
- Al registrarse, el perfil se guarda en Firestore dentro de la colección `users`.
- Para volver a entrar, usa el mismo usuario y contraseña en la pestaña **Entrar**.

> Nota técnica: Firebase Auth se usa para abrir una sesión anónima y Firestore almacena el perfil familiar con el usuario y un hash de contraseña. Esto permite usar usuario `admin` / contraseña `admin`, algo que Firebase Email/Password no permite directamente porque exige emails y contraseñas de al menos 6 caracteres.


## Configurar usuarios en Firebase

Para que el login y el registro funcionen necesitas configurar **dos cosas** en Firebase: Authentication y Firestore.

### 1. Authentication

1. Entra en Firebase Console.
2. Abre tu proyecto.
3. Ve a **Build > Authentication**.
4. Pulsa **Get started** si es la primera vez.
5. En **Sign-in method**, activa **Anonymous / Anónimo**.

La app usa Firebase Auth anónimo como sesión técnica y guarda el usuario familiar en Firestore. Por eso, si no activas Anonymous, al pulsar **Entrar** o **Registrarme** verás un error.

### 2. Firestore Database

1. Ve a **Build > Firestore Database**.
2. Pulsa **Create database**.
3. Elige una región, por ejemplo Europa si está disponible.
4. Para desarrollo puedes empezar en test mode, pero luego despliega `firestore.rules`.

### 3. Variables `.env`

En Firebase, abre **Project settings > General > Your apps** y copia la configuración de tu app web en el archivo `.env`:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Después para el servidor y vuelve a arrancarlo:

```bash
npm run dev
```

### 4. Crear usuarios

No tienes que crear los usuarios familiares a mano en Firebase:

- El admin entra con usuario `admin` y contraseña `admin`.
- Cada familiar pulsa **Registrarme**.
- Al registrarse, la app crea automáticamente un documento en Firestore: `users/{uid}`.
- En ese documento se guardan `username`, `name`, `role`, `teamId`, `money`, `copitaCount`, `seasonPoints`, `totalPoints` y `passwordHash`.

### 5. Comprobar que se guardó

Después de registrar un usuario:

1. Ve a **Firestore Database > Data**.
2. Abre la colección `users`.
3. Deberías ver un documento con el perfil registrado.

Si ves el error “Firebase no está listo”, normalmente falta una de estas cosas:

- No copiaste las claves de Firebase al `.env`.
- No reiniciaste `npm run dev` después de editar `.env`.
- No activaste **Authentication > Anonymous**.
- No creaste **Firestore Database**.
- No desplegaste o ajustaste las reglas de Firestore.



## Error: “Has entrado, pero no se pudo guardar el perfil”

Ese mensaje significa que **Firebase Auth sí ha iniciado sesión**, pero **Firestore ha rechazado o no ha podido guardar** el documento del usuario en `users/{uid}`. Revisa esto en orden:

1. En Firebase Console, confirma que existe **Build > Firestore Database**. Si no existe, pulsa **Create database**.
2. Despliega las reglas del repo:

```bash
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

3. Comprueba que tu `.env` apunta al mismo proyecto donde creaste Firestore. El `VITE_FIREBASE_PROJECT_ID` debe coincidir exactamente con el ID del proyecto en Firebase.
4. Reinicia Vite después de cambiar `.env`:

```bash
npm run dev
```

5. Abre la consola del navegador con **F12 > Console**. Ahora la app imprime el error real de Firebase, por ejemplo `permission-denied`, `not-found` o `unavailable`.

Para una prueba rápida, en Firestore puedes poner temporalmente reglas de desarrollo muy abiertas, solo unos minutos:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Si con esas reglas funciona, el problema eran las reglas. Después vuelve a desplegar las reglas seguras del repo con `firebase deploy --only firestore:rules`.

## Dónde se guardan usuarios, quinielas y puntos

La app ya no depende de una lista fija de usuarios en el código para funcionar con Firebase:

- Los usuarios registrados se leen de Firestore en la colección `users`.
- Cuando un familiar se registra desde la web, se crea o actualiza `users/{uid}` y queda guardado para siguientes sesiones.
- Las jornadas se leen de `rounds`.
- Los partidos de una jornada se leen de `rounds/{roundId}/matches`.
- Las quinielas enviadas se leen y guardan en `rounds/{roundId}/predictions`.

En el panel de administrador ahora hay secciones para:

1. **Crear jornadas**: ver jornadas existentes, crear/editar jornada y añadir los partidos.
2. **Añadir resultados**: seleccionar una jornada creada, poner los resultados reales y confirmar para actualizar clasificaciones.
3. **Ver quinielas**: elegir una jornada y revisar las quinielas enviadas por cada usuario.
4. **Usuarios**: consultar usuarios registrados y puntos.
5. **Recalcular clasificación**: al confirmar resultados se guardan resultados, se cierra la jornada y se actualizan puntos en los documentos de usuario.

## Crear y configurar Firebase paso a paso

### 1. Crear proyecto
1. Entra en [Firebase Console](https://console.firebase.google.com/).
2. Pulsa **Add project / Añadir proyecto**.
3. Ponle un nombre, por ejemplo `quiniela-familiar-2026`.
4. Google Analytics es opcional; para empezar puedes desactivarlo.

### 2. Registrar una app web
1. Dentro del proyecto, pulsa el icono web `</>`.
2. Nombre de app: `quiniela-web`.
3. Puedes marcar Firebase Hosting si quieres, aunque también se puede configurar luego.
4. Firebase te dará una configuración parecida a:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Copia esos valores en `.env` usando las claves `VITE_`:

```bash
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_ADMIN_EMAIL=admin@example.com
```

Después reinicia `npm run dev`, porque Vite solo lee `.env` al arrancar.

### 3. Activar Firebase Auth
1. En Firebase Console, ve a **Build > Authentication**.
2. Pulsa **Get started**.
3. En **Sign-in method**, activa **Anonymous / Anónimo**.

La base actual usa login anónimo para que la familia entre con una clave/nombre sencillo sin contraseñas complicadas. Más adelante puedes cambiarlo a email, Google o códigos familiares.

### 4. Crear Firestore Database
1. Ve a **Build > Firestore Database**.
2. Pulsa **Create database**.
3. Para desarrollo, puedes empezar en modo test unos minutos, pero lo recomendable es desplegar las reglas del repo cuanto antes.
4. Elige región europea si la familia está en España, por ejemplo `eur3` si está disponible.

### 5. Desplegar reglas de Firestore
Desde la terminal del proyecto:

```bash
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

Cuando `firebase use --add` pregunte, elige tu proyecto de Firebase.

## Probar la base de datos Firestore

### Opción rápida desde la consola Firebase
Puedes crear documentos manualmente en **Firestore Database > Data**.

Colecciones recomendadas para empezar:

#### `users`
Crea un documento por participante. Para el administrador, usa el UID real que aparece en Authentication cuando entras en la web por primera vez.

Ejemplo de documento `users/{uidDelAdmin}`:

```json
{
  "name": "Admin",
  "role": "admin",
  "teamId": "t1",
  "money": 0,
  "copitaCount": 0,
  "seasonPoints": 0,
  "totalPoints": 0
}
```

Ejemplo de participante:

```json
{
  "name": "Ana",
  "role": "participant",
  "teamId": "t1",
  "money": 0,
  "copitaCount": 0,
  "seasonPoints": 0,
  "totalPoints": 0
}
```

#### `teams`
Crea cuatro documentos:

```text
t1 -> { "name": "Equipo 1" }
t2 -> { "name": "Equipo 2" }
t3 -> { "name": "Equipo 3" }
t4 -> { "name": "Equipo 4" }
```

#### `rounds`
Crea un documento `round-1`:

```json
{
  "number": 1,
  "title": "Jornada 1",
  "status": "open",
  "deadline": "2026-08-14T12:00:00.000Z",
  "copitaId": "uidDelCopita",
  "pleno": {
    "home": "Real Madrid",
    "away": "Barcelona",
    "result": ""
  }
}
```

Dentro de `rounds/round-1`, crea subcolección `matches` con 14 documentos `m1`, `m2`, etc. Ejemplo `matches/m1`:

```json
{
  "order": 1,
  "home": "Equipo Local",
  "away": "Equipo Visitante",
  "competition": "Primera",
  "result": ""
}
```

Cuando un participante guarde su quiniela, aparecerá automáticamente:

```text
rounds/round-1/predictions/{uidDelParticipante}
```

con sus signos y Pleno al 15.

### Opción recomendada: emuladores locales
Si quieres probar sin tocar datos reales:

```bash
firebase init emulators
firebase emulators:start
```

Selecciona Auth, Firestore, Functions y Hosting. Después podrás ver los datos locales en la interfaz del emulador, normalmente `http://localhost:4000`.

> Pendiente de mejora: conectar explícitamente la app al emulador con `connectAuthEmulator` y `connectFirestoreEmulator` cuando `import.meta.env.DEV` esté activo. La estructura ya separa Firebase en `src/services/firebase.js`, así que es fácil añadirlo.

## Flujo recomendado para probar todo

1. Arranca la app con `npm run dev`.
2. Entra con nombre `admin` para ver el panel Admin local con datos mock.
3. Crea un proyecto Firebase y pega la configuración en `.env`.
4. Activa Auth anónimo.
5. Crea Firestore y despliega `firestore.rules`.
6. Entra en la app; copia tu UID desde Firebase Authentication.
7. Crea `users/{tuUid}` con `role: "admin"`.
8. Crea `teams`, `rounds/round-1` y `rounds/round-1/matches`.
9. Guarda una quiniela y comprueba en Firestore que aparece en `predictions`.
10. Cambia la jornada a `closed` y comprueba que se muestran los pronósticos de todos.

## Despliegue en Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

Para desplegar todo:

```bash
firebase deploy
```

Para funciones:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Estructura
- `src/components`: navegación y selector 1X2 reutilizable.
- `src/pages`: Inicio, Clasificación, Tablas previas, Instrucciones y Admin.
- `src/services`: Firebase, Firestore y cálculos de competición.
- `src/data/mock.js`: 12 participantes, 4 equipos y jornada inicial.
- `firestore.rules`: reglas de seguridad.
- `functions/index.js`: automatización server-side para ausentes.

## Adaptación recomendada
1. Conectar listeners reales de Firestore en `App.jsx` usando `listenCollection` y `listenDoc`.
2. Crear documentos iniciales de usuarios/equipos desde el panel o con un script seed.
3. Ajustar premios, precio y textos familiares en `Rules.jsx`.
4. Cambiar el login anónimo por email/código familiar si quieres identificar mejor a cada participante.
5. Añadir modo emulador en `src/services/firebase.js` para pruebas locales con Auth y Firestore.
