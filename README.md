# 🕵️ El Impostor

Un juego social de deducción y mímica desarrollado con **React**, **TailwindCSS**, **Zustand** y **Socket.io**.

## 🎮 Descripción

"El Impostor" es un juego de deducción social donde:

- A cada jugador se le muestra una palabra secreta, **excepto al impostor**
- Los civiles dan pistas sutiles sin revelar la palabra
- El impostor debe fingir que conoce la palabra usando las pistas de los demás
- Después de varias rondas hay votación
- Si eliminan al impostor → **ganan los civiles**
- Si eliminan a un civil → **gana el impostor**

## 🚀 Características

- ✅ **Modo Offline**: Juega localmente en el mismo dispositivo
- ✅ **Modo Online**: Crea salas y juega con amigos remotamente
- ✅ **8 Categorías de palabras**: General, Animales, Comida, Deportes, Profesiones, Lugares, Objetos, Películas
- ✅ **Interfaz moderna**: Diseñada con TailwindCSS y Framer Motion
- ✅ **Responsive**: Funciona en móviles, tablets y desktop
- ✅ **Estado en tiempo real**: Sincronización con WebSockets

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + Vite
- **Estilos**: TailwindCSS
- **Animaciones**: Framer Motion
- **Estado Global**: Zustand
- **Routing**: React Router
- **Backend**: Node.js + Express + Socket.io
- **Iconos**: Lucide React

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repo>
cd impostor
```

### 2. Instalar dependencias

```bash
# Instalar dependencias del cliente
npm install

# Instalar dependencias del servidor
cd server
npm install
cd ..
```

### 3. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env si es necesario (opcional)
```

### 4. Ejecutar el proyecto

#### Opción A: Ejecutar todo junto (recomendado)

```bash
npm run dev:all
```

Esto ejecutará:
- Frontend en [http://localhost:3000](http://localhost:3000)
- Servidor en [http://localhost:3001](http://localhost:3001)

#### Opción B: Ejecutar por separado

Terminal 1 - Cliente:
```bash
npm run dev
```

Terminal 2 - Servidor:
```bash
npm run server
```

## 🎯 Cómo Jugar

### Modo Offline (Local)

1. Abre la app
2. Ingresa tu nombre
3. Haz clic en **"Modo Local"**
4. Agrega jugadores (mínimo 3)
5. Configura las opciones del juego
6. Haz clic en **"Iniciar Juego"**
7. Cada jugador verá su rol en secreto
8. Da pistas por turnos
9. Vota por quién crees que es el impostor

### Modo Online

#### Crear Sala

1. Ingresa tu nombre
2. Haz clic en **"Crear Sala"**
3. Comparte el código de sala con tus amigos
4. Espera a que se unan
5. Inicia el juego cuando estén todos

#### Unirse a Sala

1. Ingresa tu nombre
2. Haz clic en **"Unirse"**
3. Ingresa el código de sala
4. Espera a que el anfitrión inicie el juego

## 📁 Estructura del Proyecto

```
impostor/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes UI reutilizables
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Container.jsx
│   │   └── game/            # Componentes específicos del juego
│   │       ├── PlayerCard.jsx
│   │       ├── ClueCard.jsx
│   │       └── Timer.jsx
│   ├── screens/             # Pantallas principales
│   │   ├── Home.jsx
│   │   ├── Lobby.jsx
│   │   ├── SecretWord.jsx
│   │   ├── Game.jsx
│   │   ├── Voting.jsx
│   │   └── Results.jsx
│   ├── hooks/               # Custom Hooks
│   │   ├── useGame.js
│   │   ├── useSocket.js
│   │   └── usePlayers.js
│   ├── store/               # Estado global con Zustand
│   │   └── gameStore.js
│   ├── lib/                 # Utilidades y datos
│   │   └── words.js
│   ├── types/               # Tipos de datos
│   │   └── index.js
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globales
├── server/                  # Servidor Socket.io
│   ├── index.js
│   └── package.json
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Componentes Principales

### Componentes UI

- **Button**: Botón con variantes y animaciones
- **Card**: Tarjeta con efecto glass
- **Input**: Campo de entrada estilizado
- **Container**: Contenedor con animaciones

### Componentes del Juego

- **PlayerCard**: Tarjeta de jugador con avatar y estado
- **ClueCard**: Tarjeta para mostrar pistas
- **Timer**: Temporizador con barra de progreso

### Pantallas

1. **Home**: Pantalla inicial con opciones de juego
2. **Lobby**: Sala de espera con configuración
3. **SecretWord**: Revelación del rol y palabra secreta
4. **Game**: Pantalla principal del juego con pistas
5. **Voting**: Votación para eliminar al impostor
6. **Results**: Resultados y estadísticas finales

## 🔧 Personalización

### Agregar nuevas categorías de palabras

Edita [src/lib/words.js](src/lib/words.js):

```javascript
export const WORDS = {
  // ... categorías existentes
  miCategoria: [
    'Palabra1', 'Palabra2', 'Palabra3', // ...
  ]
}

export const CATEGORIES = [
  // ... categorías existentes
  { id: 'miCategoria', name: 'Mi Categoría', icon: '🎨' }
]
```

### Personalizar colores

Edita [tailwind.config.js](tailwind.config.js):

```javascript
colors: {
  impostor: {
    dark: '#0f0f23',
    purple: '#8b5cf6',
    // Agrega más colores...
  }
}
```

## 🚢 Despliegue

### Frontend (Vercel/Netlify)

```bash
npm run build
```

Despliega la carpeta `dist/` en tu hosting preferido.

### Backend (Railway/Render/Heroku)

El servidor en `server/` puede desplegarse en cualquier plataforma que soporte Node.js.

Variables de entorno necesarias:
- `PORT`: Puerto del servidor (automático en la mayoría de plataformas)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo y modificarlo.

## 🎉 Créditos

Desarrollado con ❤️ para jugar con amigos.

---

**¡Diviértete jugando! 🎮**
