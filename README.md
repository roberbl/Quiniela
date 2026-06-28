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

## Instalación
```bash
npm install
cp .env.example .env
npm run dev
```

Rellena `.env` con la configuración de tu proyecto Firebase. Define el usuario administrador creando su documento en `users/{uid}` con `role: "admin"`.

## Firebase
```bash
npm install -g firebase-tools
firebase login
firebase use --add
npm run build
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
