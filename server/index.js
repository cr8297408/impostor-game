import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

// Almacenamiento en memoria de las salas
const rooms = new Map()

export const WORDS = {
  general: [
    'Pizza', 'Teléfono', 'Computadora', 'Guitarra', 'Bicicleta',
    'Café', 'Libro', 'Zapato', 'Reloj', 'Cámara', 'Lámpara', 'Ventana',
    'Puerta', 'Mesa', 'Sombrilla', 'Carro', 'Moto', 'Televisor',
    'Auriculares', 'Teclado', 'Mouse', 'Botella', 'Cargador',
    'Pelota', 'Cuchara', 'Plato', 'Llaves', 'Pañuelo', 'Bolsa'
  ],

  animales: [
    'Perro', 'Gato', 'León', 'Elefante', 'Jirafa', 'Delfín', 'Águila',
    'Mariposa', 'Pingüino', 'Koala', 'Tigre', 'Oso', 'Lobo', 'Zorro',
    'Ballena', 'Cocodrilo', 'Serpiente', 'Tortuga', 'Caballo', 'Vaca',
    'Camello', 'Rinoceronte', 'Hipopótamo', 'Tiburón', 'Pulpo',
    'Ardilla', 'Mapache', 'Búho', 'Halcon', 'Gorila'
  ],

  comida: [
    'Hamburguesa', 'Sushi', 'Tacos', 'Pasta', 'Ensalada', 'Helado',
    'Chocolate', 'Pastel', 'Pollo', 'Pescado', 'Sandwich', 'Sopa',
    'Arroz', 'Pan', 'Queso', 'Frutas', 'Verduras', 'Carne',
    'Huevos', 'Cereal', 'Arepa', 'Empanada', 'Paella', 'Curry',
    'Dumplings', 'Ramen', 'Tostadas', 'Birria', 'Croissant'
  ],

  deportes: [
    'Fútbol', 'Baloncesto', 'Tenis', 'Natación', 'Ciclismo', 'Boxeo',
    'Golf', 'Volleyball', 'Béisbol', 'Rugby', 'Ski', 'Patinaje',
    'Escalada', 'Surf', 'Atletismo', 'Karate', 'Yoga', 'CrossFit',
    'Gimnasia', 'Esgrima', 'Hockey', 'Badminton', 'Críquet',
    'Ping-Pong', 'Parkour'
  ],

  profesiones: [
    'Doctor', 'Profesor', 'Ingeniero', 'Chef', 'Piloto', 'Arquitecto',
    'Abogado', 'Músico', 'Actor', 'Diseñador', 'Periodista',
    'Fotógrafo', 'Policía', 'Bombero', 'Científico', 'Artista',
    'Programador', 'Dentista', 'Veterinario', 'Escritor', 'Barbero',
    'Electricista', 'Carpintero', 'Enfermero', 'Astronauta'
  ],

  lugares: [
    'París', 'Tokyo', 'Nueva York', 'Londres', 'Roma', 'Barcelona',
    'Dubai', 'Sídney', 'Ámsterdam', 'Berlín', 'Desierto', 'Selva',
    'Ciudad', 'Campo', 'Isla', 'Bosque', 'Lago', 'Río', 'Aeropuerto',
    'Museo', 'Estadio', 'Hotel', 'Universidad', 'Mercado', 'Castillo'
  ],

  objetos: [
    'Paraguas', 'Llave', 'Linterna', 'Maleta', 'Mochila', 'Gafas',
    'Sombrero', 'Bufanda', 'Guantes', 'Cinturón', 'Bolígrafo',
    'Cuaderno', 'Tijeras', 'Martillo', 'Destornillador', 'Espejo',
    'Cepillo', 'Peine', 'Toalla', 'Almohada', 'Tablet', 'Reloj',
    'Drone', 'Radio', 'Cámara GoPro'
  ],

  peliculas: [
    'Titanic', 'Avatar', 'Star Wars', 'Harry Potter', 'Matrix',
    'Inception', 'Interestelar', 'Gladiador', 'Rocky', 'Alien',
    'Terminator', 'Jurassic Park', 'Spider-Man', 'Batman', 'Superman',
    'Iron Man', 'Frozen', 'Toy Story', 'Shrek', 'Coco', 'Up',
    'Los Increíbles', 'Kung Fu Panda', 'Soul', 'WALL-E'
  ],

  videojuegos: [
    'Mario', 'Zelda', 'Fortnite', 'Minecraft', 'Halo', 'Call of Duty',
    'FIFA', 'League of Legends', 'Overwatch', 'Valorant', 'Pokémon',
    'Sonic', 'God of War', 'GTA', 'Red Dead Redemption', 'The Sims',
    'Apex Legends', 'Fall Guys', 'Among Us', 'Elden Ring'
  ],

  musica: [
    'Guitarra', 'Piano', 'Batería', 'Violín', 'Trompeta', 'Flauta',
    'Saxofón', 'DJ', 'Cantante', 'Banda', 'Ópera', 'Rock', 'Pop',
    'Salsa', 'Reggaetón', 'Rap', 'Jazz', 'Blues', 'Metal', 'Indie'
  ],

  transporte: [
    'Carro', 'Moto', 'Avión', 'Barco', 'Tren', 'Autobús', 'Taxi',
    'Helicóptero', 'Submarino', 'Tranvía', 'Patineta', 'Scooter',
    'Camión', 'Bicicleta eléctrica', 'Cohete'
  ],

  tecnologia: [
    'Smartphone', 'Laptop', 'Smartwatch', 'Tablet', 'Router',
    'Dron', 'Cámara digital', 'Micrófono', 'Auriculares', 'Impresora',
    'Servidor', 'Consola', 'USB', 'Monitor', 'VR'
  ],

  sentimientos: [
    'Alegría', 'Enojo', 'Miedo', 'Tristeza', 'Vergüenza', 'Amor',
    'Ansiedad', 'Orgullo', 'Confianza', 'Nostalgia'
  ],

  naturaleza: [
    'Volcán', 'Tornado', 'Huracán', 'Arcoíris', 'Lago', 'Montaña',
    'Río', 'Cascada', 'Valle', 'Glaciar', 'Desierto', 'Cueva'
  ],

  colores: [
    'Rojo', 'Azul', 'Verde', 'Amarillo', 'Morado', 'Naranja',
    'Rosa', 'Negro', 'Blanco', 'Gris', 'Cian', 'Marrón'
  ],

  superheroes: [
    'Superman', 'Batman', 'Spider-Man', 'Iron Man', 'Hulk',
    'Thor', 'Capitán América', 'Black Widow', 'Flash', 'Wolverine',
    'Doctor Strange', 'Aquaman', 'Deadpool'
  ],

  series: [
    'Game of Thrones', 'Breaking Bad', 'Stranger Things', 'Friends',
    'The Office', 'Sherlock', 'Narcos', 'Dark', 'Vikings',
    'The Mandalorian', 'Rick and Morty'
  ],

  instrumentos: [
    'Piano', 'Guitarra', 'Batería', 'Trompeta', 'Violín', 'Flauta',
    'Saxofón', 'Ukulele', 'Bajo', 'Arpa'
  ],

  emociones: [
    'Felicidad', 'Rabia', 'Calma', 'Sorpresa', 'Agotamiento',
    'Entusiasmo', 'Confusión', 'Envidia', 'Terror', 'Paz'
  ],

  ropa: [
    'Camiseta', 'Pantalón', 'Zapatos', 'Gorra', 'Chaqueta',
    'Falda', 'Vestido', 'Sandalias', 'Botas', 'Guantes'
  ],

  herramientas: [
    'Martillo', 'Taladro', 'Destornillador', 'Llave inglesa',
    'Sierra', 'Alicate', 'Cuter', 'Nivel', 'Lijadora', 'Soldador'
  ],

  ciencia: [
    'Átomo', 'Molécula', 'Energía', 'Gravedad', 'Planeta',
    'Bacteria', 'Virus', 'Evolución', 'Fotosíntesis', 'ADN'
  ],

  astrología: [
    'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
    'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
  ],

  juguetes: [
    'Yoyo', 'Lego', 'Pelota saltarina', 'Muñeco', 'Carrito', 'Nerf',
    'Cubos', 'Rompecabezas', 'Slime', 'Burbuja', 'Cometa',
    'Trampolín', 'Pistola de agua', 'Peluche', 'Hula Hula'
  ],

  electrodomesticos: [
    'Microondas', 'Licuadora', 'Aspiradora', 'Plancha', 'Tostadora',
    'Ventilador', 'Horno', 'Lavadora', 'Secadora', 'Freidora de aire',
    'Cafetera', 'Batidora', 'Refrigerador'
  ],

  fiestas: [
    'Globos', 'Piñata', 'Pastel', 'Velas', 'Confeti', 'Serpentina',
    'Disfraz', 'Payaso', 'Cotillón', 'Música', 'Maracas', 'Bongos',
    'Sombrero de fiesta', 'Regalos'
  ],

  escuela: [
    'Pupitre', 'Mochila', 'Tiza', 'Pizarra', 'Libro', 'Lonchera',
    'Examen', 'Recreo', 'Profesor', 'Borrador', 'Cuaderno',
    'Tijeras', 'Pegante', 'Regla'
  ],

  fantasía: [
    'Dragón', 'Hada', 'Duende', 'Mago', 'Unicornio', 'Bruja',
    'Elfo', 'Troll', 'Gólem', 'Hechizo', 'Varita', 'Grimorio',
    'Pegaso', 'Sirena'
  ],

  memes: [
    'Gato enojado', 'Perro Cheems', 'Doge', 'Shrek sorprendido',
    'Meme del ataúd', 'Spider-Man señalándose', 'Distracted boyfriend',
    'NPC', 'Risa malévola', 'Soy ese', 'El Pepe'
  ],

  cosas_incomodas: [
    'Silencio incómodo', 'Abrazo raro', 'Apretón débil',
    'Zapato mojado', 'Olor sospechoso', 'Mensaje doble',
    'Risa falsa', 'Selfie fallida', 'Mano sudada',
    'Nombre equivocado', 'Saludo fallido', 'Pies fríos'
  ],

  actividades_random: [
    'Bailar mal', 'Cantar en la ducha', 'Perder las llaves',
    'Dormir en el bus', 'Tropezar', 'Reírse solo',
    'Hablar con el espejo', 'Quemar arroz', 'Olvidar el paraguas',
    'Gritar por un insecto', 'Buscar señal'
  ],

  palabras_raras: [
    'Chirimbolo', 'Guaracha', 'Chisguete', 'Totuma', 'Chanfle',
    'Ñáñara', 'Baratija', 'Cachivache', 'Trasto', 'Zángano',
    'Pereque', 'Faramalla', 'Guachafita'
  ],

  hogar: [
    'Sofá', 'Cortina', 'Planta', 'Zapatero', 'Escoba', 'Trapeador',
    'Estante', 'Alfombra', 'Cojín', 'Jarrón', 'Veladora'
  ],

  oficina: [
    'Grapadora', 'Archivador', 'Teclado', 'Monitor', 'Café frío',
    'Post-it', 'Carpeta', 'Agenda', 'Silla giratoria',
    'Clip', 'Portátil', 'Audífonos'
  ],

  clima: [
    'Granizo', 'Neblina', 'Relámpago', 'Trueno', 'Llovizna',
    'Tormenta', 'Solazo', 'Frío polar', 'Calor infernal'
  ],

  sonidos: [
    'Ronquido', 'Eructo', 'Aplauso', 'Chasquido', 'Crujido',
    'Silbido', 'Golpe', 'Susurro', 'Carcajada', 'Bostezo'
  ],

  acciones_graciosas: [
    'Resbalar', 'Bailar raro', 'Estornudo explosivo',
    'Hablar dormido', 'Cantar desafinado', 'Chocar la mano mal',
    'Gritar por nada', 'Saltar de susto', 'Confundir personas',
    'Caer de la silla'
  ],

  transporte_ridiculo: [
    'Patineta eléctrica', 'Zapatillas con ruedas', 'Monociclo',
    'Scooter roto', 'Carrito de supermercado', 'Trencito infantil',
    'Coche de bebé', 'Triciclo', 'Caballito de madera'
  ],

  cosas_pequenas: [
    'Canica', 'Botón', 'Moneda', 'Clip', 'Caramelo', 'Goma de borrar',
    'Llavero', 'Ficha de dominó', 'Ojito móvil', 'Confeti'
  ],

  comida_rara: [
    'Sopa fría', 'Huevos verdes', 'Pan quemado', 'Pizza dulce',
    'Arroz azul', 'Tamal gigante', 'Café salado', 'Gelatina extraña',
    'Perro caliente con piña'
  ],

  personajes_random: [
    'Señora de los gatos', 'Tío chistoso', 'Vecino misterioso',
    'Niño hiperactivo', 'Abuelo sabio', 'Amigo que grita',
    'Persona demasiado feliz', 'Compañero dormido'
  ],

  cosas_que_huelen: [
    'Perfume fuerte', 'Zapato mojado', 'Comida recalentada',
    'Cebolla', 'Sudor', 'Ambientador exagerado', 'Gasolina',
    'Té de hierbas', 'Ropa guardada'
  ],

  cosas_pegajosas: [
    'Miel', 'Slime', 'Chicle', 'Mermelada', 'Salsa', 'Pegamento',
    'Caramelo derretido', 'Gel para el pelo'
  ],

  cosas_que_asustan: [
    'Sombra extraña', 'Grito', 'Insecto grande', 'Perro ladrando',
    'Trueno fuerte', 'Puerta que se mueve', 'Gato saltando',
    'Silencio total', 'Teléfono sonando de noche'
  ],
  cosas_que_no_existen: [
    'Unicornio ladrón', 'Perro con alas', 'Gato gigante',
    'Silla invisible', 'Pan que habla', 'Zapato volador',
    'Dragón de oficina', 'Pez en bicicleta', 'Café infinito',
    'Sombrero inteligente', 'Planta que canta'
  ],

  objetos_sospechosos: [
    'Caja que vibra', 'Bolsa misteriosa', 'Sobre sin remitente',
    'Llave que no abre nada', 'Control remoto sin televisor',
    'Botón rojo', 'Maleta demasiado pesada', 'Sombrero extraño'
  ],

  cosas_que_harias_en_secreto: [
    'Bailar solo', 'Hablar con un espejo', 'Practicar poses',
    'Cantar reggaetón a escondidas', 'Stalkear ex',
    'Comer a medianoche', 'Reír por memes viejos', 'Ver historias sin sonido'
  ],

  animales_tontos: [
    'Gallina confundida', 'Perro que se cae', 'Gato sorprendido',
    'Pato desesperado', 'Conejo lento', 'Oveja dramática',
    'Cabra gritona', 'Cerdo risueño'
  ],

  cosas_que_da_pena: [
    'Tropezar en público', 'Saludar a quien no es',
    'Decir “igualmente” cuando no toca',
    'Confundir el nombre de alguien',
    'Gritar sin querer', 'Que te llamen por megáfono'
  ],

  cosas_que_no_deberian_moverse: [
    'Silla', 'Escoba', 'Árbol pequeño', 'Maceta', 'Televisor',
    'Zapatos', 'Cortina', 'Mesa', 'Almohada'
  ],

  cosas_muy_especificas: [
    'La tapa de la tapa', 'El cable del cargador del vecino',
    'La esquina del sofá', 'La esquina de la caja de cereal',
    'El tornillo suelto', 'La etiqueta que pica'
  ],

  excusas_malas: [
    'Había tráfico de tortugas', 'Mi perro apagó el despertador',
    'Se cayó el internet emocional', 'Perdí el sentido del tiempo',
    'Me dormí pensando', 'Mi fantasma me distrajo'
  ],

  acciones_que_parecen_sospechosas: [
    'Mirar a todos lados', 'Esconder algo', 'Hablar bajito',
    'Tocar muchas veces un bolsillo', 'Reirse solo',
    'Caminar rápido sin razón', 'Voltear de golpe'
  ],

  inventos_raros: [
    'Cepillo para cejas de perro', 'Silla con wifi',
    'Calcetines con GPS', 'Sombrero con linterna',
    'Cuchara traductora', 'Lámpara que flota',
    'Radio solar para gatos'
  ],

  cosas_pegajosas_extremas: [
    'Slime explosivo', 'Miel chorreando', 'Pegamento eterno',
    'Chicle derretido', 'Salsa derramada', 'Caramelo fundido'
  ],

  cosas_demasiado_silenciosas: [
    'Calcetín', 'Sombrero', 'Botella vacía', 'Lapicero sin tinta',
    'Caja de cartón', 'Banano dormido'
  ],

  cosas_que_suenan_raro: [
    'Pato enfadado', 'Puerta vieja', 'Gato con hambre',
    'Silla vieja', 'Zapato mojado', 'Auto sin aceite'
  ],

  objetos_magicamente_inutiles: [
    'Cuchara transparente', 'Libro sin páginas',
    'Linterna solar de noche', 'Sombrero sin fondo',
    'Reloj sin números', 'Lápiz sin punta', 'Escalera plana'
  ],

  lugares_raros: [
    'La esquina del supermercado', 'Un pasillo infinito',
    'La cola equivocada', 'La silla que nadie usa',
    'El sótano prohibido', 'El cuarto del ruido'
  ],

  cosas_que_nadie_admite: [
    'Comerse las uñas', 'Oler ropa limpia', 'Buscar memes viejos',
    'Hablar solo', 'Dormir en reuniones', 'Repetir outfits'
  ],

  comida_imposible: [
    'Pizza líquida', 'Café sólido', 'Ensalada caliente',
    'Helado de pollo', 'Pan sin harina', 'Chocolate salado',
    'Tamal transparente'
  ],

  cosas_chiquitas_but_poderosas: [
    'Chinche', 'Mosquito', 'Confeti', 'Semilla', 'Arena',
    'Granito de arroz', 'Tornillito', 'Astilla'
  ]

}


export const CATEGORIES = [
  { id: 'general', name: 'General', icon: '🎯' },
  { id: 'animales', name: 'Animales', icon: '🦁' },
  { id: 'comida', name: 'Comida', icon: '🍕' },
  { id: 'deportes', name: 'Deportes', icon: '⚽' },
  { id: 'profesiones', name: 'Profesiones', icon: '👨‍⚕️' },
  { id: 'lugares', name: 'Lugares', icon: '🌍' },
  { id: 'objetos', name: 'Objetos', icon: '📦' },
  { id: 'peliculas', name: 'Películas', icon: '🎬' },
  { id: 'videojuegos', name: 'Videojuegos', icon: '🎮' },
  { id: 'musica', name: 'Música', icon: '🎵' },
  { id: 'transporte', name: 'Transporte', icon: '🛵' },
  { id: 'tecnologia', name: 'Tecnología', icon: '💻' },
  { id: 'sentimientos', name: 'Sentimientos', icon: '💓' },
  { id: 'naturaleza', name: 'Naturaleza', icon: '⛰️' },
  { id: 'colores', name: 'Colores', icon: '🎨' },
  { id: 'superheroes', name: 'Superhéroes', icon: '🦸' },
  { id: 'series', name: 'Series', icon: '📺' },
  { id: 'instrumentos', name: 'Instrumentos', icon: '🎸' },
  { id: 'emociones', name: 'Emociones', icon: '😄' },
  { id: 'ropa', name: 'Ropa', icon: '👕' },
  { id: 'herramientas', name: 'Herramientas', icon: '🛠️' },
  { id: 'ciencia', name: 'Ciencia', icon: '🔬' },
  { id: 'astrología', name: 'Astrología', icon: '♈' },
  { id: 'juguetes', name: 'Juguetes', icon: '🧸' },
  { id: 'electrodomesticos', name: 'Electrodomésticos', icon: '🔌' },
  { id: 'fiestas', name: 'Fiestas', icon: '🎉' },
  { id: 'escuela', name: 'Escuela', icon: '🏫' },
  { id: 'fantasía', name: 'Fantasía', icon: '🧙' },
  { id: 'memes', name: 'Memes', icon: '😂' },
  { id: 'cosas_incomodas', name: 'Cosas Incómodas', icon: '😬' },
  { id: 'actividades_random', name: 'Actividades Random', icon: '🤪' },
  { id: 'palabras_raras', name: 'Palabras Raras', icon: '🤔' },
  { id: 'hogar', name: 'Hogar', icon: '🏠' },
  { id: 'oficina', name: 'Oficina', icon: '🏢' },
  { id: 'clima', name: 'Clima', icon: '🌦️' },
  { id: 'sonidos', name: 'Sonidos', icon: '🔊' },
  { id: 'acciones_graciosas', name: 'Acciones Graciosas', icon: '🤣' },
  { id: 'transporte_ridiculo', name: 'Transporte Ridículo', icon: '🛴' },
  { id: 'cosas_pequenas', name: 'Cosas Pequeñas', icon: '🔍' },
  { id: 'comida_rara', name: 'Comida Rara', icon: '🍳' },
  { id: 'personajes_random', name: 'Personajes Random', icon: '🎭' },
  { id: 'cosas_que_huelen', name: 'Cosas que Huelen', icon: '👃' },
  { id: 'cosas_pegajosas', name: 'Cosas Pegajosas', icon: '🍯' },
  { id: 'cosas_que_asustan', name: 'Cosas que Asustan', icon: '👻' },
  { id: 'cosas_que_no_existen', name: 'Cosas que No Existen', icon: '🦄' },
  { id: 'objetos_sospechosos', name: 'Objetos Sospechosos', icon: '🕵️' },
  { id: 'cosas_que_harias_en_secreto', name: 'Cosas en Secreto', icon: '🤫' },
  { id: 'animales_tontos', name: 'Animales Tontos', icon: '🐔' },
  { id: 'cosas_que_da_pena', name: 'Cosas que Dan Pena', icon: '🙈' },
  { id: 'cosas_que_no_deberian_moverse', name: 'Cosas Inmóviles', icon: '🪑' },
  { id: 'cosas_muy_especificas', name: 'Cosas Muy Específicas', icon: '📌' },
  { id: 'excusas_malas', name: 'Excusas Malas', icon: '🤥' },
  { id: 'acciones_que_parecen_sospechosas', name: 'Acciones Sospechosas', icon: '🧐' },
  { id: 'inventos_raros', name: 'Inventos Raros', icon: '💡' },
  { id: 'cosas_pegajosas_extremas', name: 'Pegajosas Extremas', icon: '🧴' },
  { id: 'cosas_demasiado_silenciosas', name: 'Cosas Silenciosas', icon: '🤐' },
  { id: 'cosas_que_suenan_raro', name: 'Cosas que Suenan Raro', icon: '🔔' },
  { id: 'objetos_magicamente_inutiles', name: 'Objetos Inútiles', icon: '🪄' },
  { id: 'lugares_raros', name: 'Lugares Raros', icon: '🚪' },
  { id: 'cosas_que_nadie_admite', name: 'Cosas que Nadie Admite', icon: '🙊' },
  { id: 'comida_imposible', name: 'Comida Imposible', icon: '🍝' },
  { id: 'cosas_chiquitas_but_poderosas', name: 'Chiquitas pero Poderosas', icon: '⚡' },
]


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size })
})

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id)

  // Unirse a una sala
  socket.on('join-room', ({ roomId, playerId }) => {
    socket.join(roomId)
    console.log(`Jugador ${playerId} se unió a la sala ${roomId}`)

    // Enviar estado actual de la sala
    const room = rooms.get(roomId)
    if (room) {
      socket.emit('room-state', room)
    } else {
      // Crear nueva sala
      rooms.set(roomId, {
        roomId,
        players: [],
        phase: 'lobby',
        config: {
          maxPlayers: 8,
          rounds: 3,
          category: 'general',
          timePerClue: 60,
        }
      })
    }
  })

  // Agregar jugador
  socket.on('add-player', ({ roomId, player }) => {
    const room = rooms.get(roomId)
    if (!room) return

    // Verificar si el jugador ya existe
    const existingPlayer = room.players.find(p => p.id === player.id)
    if (!existingPlayer) {
      room.players.push(player)
      io.to(roomId).emit('player-joined', player)
      io.to(roomId).emit('room-state', room)
    }
  })

  // Iniciar juego
  socket.on('start-game', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (!room || room.players.length < 3) return

    // Asignar impostor
    const impostorIndex = Math.floor(Math.random() * room.players.length)
    room.players = room.players.map((player, index) => ({
      ...player,
      isImpostor: index === impostorIndex,
      isEliminated: false,
      votes: 0,
    }))

    // Seleccionar palabra
    const categoryWords = WORDS[room.config.category] || WORDS.general
    room.secretWord = categoryWords[Math.floor(Math.random() * categoryWords.length)]

    // Actualizar estado
    room.phase = 'secret'
    room.currentRound = 1
    room.currentTurn = 0
    room.clues = []
    room.votes = {}
    room.maxRounds = room.config.rounds

    io.to(roomId).emit('game-started', room)
    io.to(roomId).emit('room-state', room)
  })

  // Añadir pista
  socket.on('add-clue', ({ roomId, playerId, text }) => {
    const room = rooms.get(roomId)
    if (!room) return

    const player = room.players.find(p => p.id === playerId)
    if (!player) return

    const clue = {
      playerId,
      playerName: player.name,
      text,
      round: room.currentRound,
    }

    room.clues.push(clue)

    // Avanzar turno
    const activePlayers = room.players.filter(p => !p.isEliminated)
    room.currentTurn++

    if (room.currentTurn >= activePlayers.length) {
      if (room.currentRound >= room.maxRounds) {
        // Ir a votación
        room.phase = 'voting'
      } else {
        // Siguiente ronda
        room.currentRound++
        room.currentTurn = 0
      }
    }

    io.to(roomId).emit('clue-added', { playerId, text })
    io.to(roomId).emit('room-state', room)
  })

  // Votar
  socket.on('submit-vote', ({ roomId, voterId, votedPlayerId }) => {
    const room = rooms.get(roomId)
    if (!room) return

    room.votes[voterId] = votedPlayerId

    io.to(roomId).emit('vote-submitted', { voterId, votedPlayerId })
    io.to(roomId).emit('room-state', room)

    // Verificar si todos votaron
    const activePlayers = room.players.filter(p => !p.isEliminated)
    if (Object.keys(room.votes).length === activePlayers.length) {
      // Calcular resultados
      const voteCounts = {}
      Object.values(room.votes).forEach(votedId => {
        voteCounts[votedId] = (voteCounts[votedId] || 0) + 1
      })

      let maxVotes = 0
      let eliminatedId = null

      Object.entries(voteCounts).forEach(([playerId, count]) => {
        if (count > maxVotes) {
          maxVotes = count
          eliminatedId = playerId
        }
      })

      if (eliminatedId) {
        room.players = room.players.map(p => ({
          ...p,
          isEliminated: p.id === eliminatedId ? true : p.isEliminated,
          votes: voteCounts[p.id] || 0,
        }))

        const eliminatedPlayer = room.players.find(p => p.id === eliminatedId)
        room.eliminatedPlayer = eliminatedPlayer

        // Determinar ganador
        room.winner = eliminatedPlayer.isImpostor ? 'civilians' : 'impostor'
        room.phase = 'results'

        io.to(roomId).emit('game-ended', {
          winner: room.winner,
          eliminatedPlayer: room.eliminatedPlayer
        })
        io.to(roomId).emit('room-state', room)
      }
    }
  })

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id)
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor de El Impostor corriendo en puerto ${PORT}`)
  console.log(`📡 WebSocket Server activo`)
})
