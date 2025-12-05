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

// La categoría "general" contiene todas las palabras de todas las categorías
WORDS.general = Object.keys(WORDS)
  .filter(key => key !== 'general')
  .flatMap(key => WORDS[key])
  .filter((word, index, self) => self.indexOf(word) === index) // Eliminar duplicados

// Pistas falsas para el impostor (palabras relacionadas que puede usar en la primera ronda)
export const HINTS = {
  // General
  'Pizza': ['Horno', 'Queso', 'Masa', 'Italiana', 'Tomate'],
  'Teléfono': ['Pantalla', 'Llamadas', 'Aplicaciones', 'Contactos', 'Batería'],
  'Computadora': ['Teclado', 'Pantalla', 'Programas', 'Internet', 'Mouse'],
  'Guitarra': ['Cuerdas', 'Música', 'Acordes', 'Amplificador', 'Rockero'],
  'Bicicleta': ['Pedales', 'Ruedas', 'Manubrio', 'Cadena', 'Ejercicio'],
  'Café': ['Taza', 'Cafeína', 'Caliente', 'Amargo', 'Mañana'],
  'Libro': ['Páginas', 'Portada', 'Autor', 'Biblioteca', 'Leer'],
  'Zapato': ['Suela', 'Cordones', 'Pie', 'Caminar', 'Par'],
  'Reloj': ['Hora', 'Manecillas', 'Alarma', 'Pulsera', 'Tiempo'],
  'Cámara': ['Fotos', 'Lente', 'Flash', 'Recuerdos', 'Enfoque'],
  'Lámpara': ['Luz', 'Bombilla', 'Iluminar', 'Noche', 'Interruptor'],
  'Ventana': ['Vidrio', 'Vista', 'Cortina', 'Abrir', 'Marco'],
  'Puerta': ['Entrada', 'Cerradura', 'Llave', 'Marco', 'Timbre'],
  'Mesa': ['Madera', 'Comer', 'Patas', 'Superficie', 'Sillas'],
  'Sombrilla': ['Playa', 'Sol', 'Sombra', 'Paraguas', 'Verano'],
  'Carro': ['Motor', 'Ruedas', 'Conducir', 'Gasolina', 'Volante'],
  'Moto': ['Velocidad', 'Casco', 'Ruedas', 'Motor', 'Escape'],
  'Televisor': ['Pantalla', 'Control', 'Canales', 'Programas', 'Netflix'],
  'Auriculares': ['Música', 'Oídos', 'Cable', 'Sonido', 'Bluetooth'],
  'Teclado': ['Teclas', 'Escribir', 'QWERTY', 'Computadora', 'Enter'],
  'Mouse': ['Click', 'Cursor', 'Scroll', 'Ratón', 'Pad'],
  'Botella': ['Líquido', 'Tapa', 'Plástico', 'Beber', 'Agua'],
  'Cargador': ['Cable', 'Electricidad', 'Batería', 'Enchufe', 'Puerto'],
  'Pelota': ['Redonda', 'Jugar', 'Botar', 'Deporte', 'Aire'],
  'Cuchara': ['Sopa', 'Metal', 'Cubierto', 'Comer', 'Mango'],
  'Plato': ['Comida', 'Redondo', 'Cerámica', 'Mesa', 'Lavar'],
  'Llaves': ['Abrir', 'Metal', 'Puerta', 'Llavero', 'Cerradura'],
  'Pañuelo': ['Nariz', 'Tela', 'Bolsillo', 'Mocos', 'Desechable'],
  'Bolsa': ['Cargar', 'Plástico', 'Compras', 'Guardar', 'Asa'],

  // Animales
  'Perro': ['Collar', 'Ladrido', 'Pelota', 'Paseo', 'Fiel'],
  'Gato': ['Maullido', 'Bigotes', 'Independiente', 'Arañazos', 'Ronroneo'],
  'León': ['Melena', 'Rugido', 'Sabana', 'Caza', 'Rey'],
  'Elefante': ['Trompa', 'Colmillos', 'Grande', 'Memoria', 'Gris'],
  'Jirafa': ['Cuello', 'Manchas', 'Alto', 'Hojas', 'Sabana'],
  'Delfín': ['Mar', 'Inteligente', 'Saltos', 'Nadar', 'Mamífero'],
  'Águila': ['Plumas', 'Volar', 'Garras', 'Vista', 'Rapaz'],
  'Mariposa': ['Alas', 'Flores', 'Colores', 'Metamorfosis', 'Volar'],
  'Pingüino': ['Hielo', 'Esmoquin', 'Pescar', 'Antártida', 'Caminar'],
  'Koala': ['Eucalipto', 'Australia', 'Dormir', 'Gris', 'Árbol'],
  'Tigre': ['Rayas', 'Felino', 'Caza', 'Selva', 'Naranja'],
  'Oso': ['Peludo', 'Miel', 'Hibernar', 'Cueva', 'Grande'],
  'Lobo': ['Aullido', 'Manada', 'Luna', 'Bosque', 'Caza'],
  'Zorro': ['Astuto', 'Cola', 'Naranja', 'Bosque', 'Orejas'],
  'Ballena': ['Océano', 'Grande', 'Cantar', 'Mamífero', 'Soplido'],
  'Cocodrilo': ['Dientes', 'Río', 'Verde', 'Reptil', 'Mandíbula'],
  'Serpiente': ['Escamas', 'Veneno', 'Lengua', 'Reptil', 'Sinuosa'],
  'Tortuga': ['Caparazón', 'Lenta', 'Longeva', 'Calma', 'Verde'],
  'Caballo': ['Galopar', 'Montar', 'Crin', 'Relinchar', 'Herradura'],
  'Vaca': ['Leche', 'Mugir', 'Campo', 'Manchas', 'Ubre'],
  'Camello': ['Joroba', 'Desierto', 'Arena', 'Resistencia', 'Sed'],
  'Rinoceronte': ['Cuerno', 'Gris', 'Grande', 'África', 'Piel'],
  'Hipopótamo': ['Agua', 'Grande', 'Boca', 'África', 'Peligroso'],
  'Tiburón': ['Aletas', 'Dientes', 'Océano', 'Peligro', 'Nadar'],
  'Pulpo': ['Tentáculos', 'Inteligente', 'Tinta', 'Mar', 'Ventosas'],
  'Ardilla': ['Nueces', 'Cola', 'Árbol', 'Rápida', 'Saltar'],
  'Mapache': ['Máscara', 'Nocturno', 'Basura', 'Manos', 'Astuto'],
  'Búho': ['Noche', 'Sabio', 'Ojos', 'Plumas', 'Rotación'],
  'Halcon': ['Rapaz', 'Volar', 'Vista', 'Caza', 'Veloz'],
  'Gorila': ['Fuerte', 'Pecho', 'Selva', 'Inteligente', 'Grande'],

  // Comida
  'Hamburguesa': ['Pan', 'Carne', 'Papas', 'Rápida', 'Queso'],
  'Sushi': ['Arroz', 'Pescado', 'Palillos', 'Japonés', 'Rollo'],
  'Tacos': ['Tortilla', 'Salsa', 'Mexicano', 'Picante', 'Carne'],
  'Pasta': ['Salsa', 'Italiana', 'Hervir', 'Tenedor', 'Spaguetti'],
  'Ensalada': ['Verde', 'Verduras', 'Fresco', 'Saludable', 'Lechuga'],
  'Helado': ['Frío', 'Dulce', 'Cono', 'Sabores', 'Derretir'],
  'Chocolate': ['Cacao', 'Dulce', 'Barra', 'Derretir', 'Postre'],
  'Pastel': ['Cumpleaños', 'Velas', 'Dulce', 'Horno', 'Rebanada'],
  'Pollo': ['Asado', 'Carne', 'Blanco', 'Cocinar', 'Alas'],
  'Pescado': ['Mar', 'Espinas', 'Frito', 'Escamas', 'Omega'],
  'Sandwich': ['Pan', 'Jamón', 'Queso', 'Rápido', 'Frío'],
  'Sopa': ['Caliente', 'Cuchara', 'Líquida', 'Olla', 'Vapor'],
  'Arroz': ['Grano', 'Blanco', 'Hervir', 'Asiático', 'Acompañar'],
  'Pan': ['Horno', 'Harina', 'Corteza', 'Levadura', 'Miga'],
  'Queso': ['Leche', 'Amarillo', 'Derretir', 'Cremoso', 'Holanda'],
  'Frutas': ['Vitaminas', 'Dulce', 'Jugoso', 'Natural', 'Colores'],
  'Verduras': ['Verde', 'Saludable', 'Vitaminas', 'Cocinar', 'Mercado'],
  'Carne': ['Proteína', 'Roja', 'Asar', 'Jugosa', 'Grill'],
  'Huevos': ['Gallina', 'Proteína', 'Freír', 'Yema', 'Clara'],
  'Cereal': ['Leche', 'Desayuno', 'Crujiente', 'Caja', 'Tazón'],
  'Arepa': ['Maíz', 'Venezolana', 'Redonda', 'Relleno', 'Plancha'],
  'Empanada': ['Relleno', 'Frita', 'Masa', 'Doblar', 'Crujiente'],
  'Paella': ['Arroz', 'Española', 'Mariscos', 'Azafrán', 'Sartén'],
  'Curry': ['Picante', 'Especias', 'Indio', 'Amarillo', 'Arroz'],
  'Dumplings': ['Vapor', 'Asiático', 'Relleno', 'Masa', 'Pequeño'],
  'Ramen': ['Fideos', 'Caldo', 'Japonés', 'Caliente', 'Tazón'],
  'Tostadas': ['Pan', 'Crujiente', 'Mantequilla', 'Dorado', 'Desayuno'],
  'Birria': ['Mexicana', 'Carne', 'Consomé', 'Picante', 'Tacos'],
  'Croissant': ['Francés', 'Hojaldrado', 'Mantequilla', 'Desayuno', 'Cuerno'],

  // Deportes
  'Fútbol': ['Balón', 'Gol', 'Cancha', 'Equipo', 'Mundial'],
  'Baloncesto': ['Canasta', 'Pelota', 'Driblar', 'Altura', 'NBA'],
  'Tenis': ['Raqueta', 'Red', 'Pelota', 'Saque', 'Wimbledon'],
  'Natación': ['Agua', 'Piscina', 'Crol', 'Gafas', 'Brazada'],
  'Ciclismo': ['Ruedas', 'Pedales', 'Ruta', 'Casco', 'Cadena'],
  'Boxeo': ['Guantes', 'Ring', 'Golpes', 'Rounds', 'Knock-out'],
  'Golf': ['Hoyo', 'Palo', 'Verde', 'Swing', 'Pelota'],
  'Volleyball': ['Red', 'Pelota', 'Remate', 'Saque', 'Playa'],
  'Béisbol': ['Bat', 'Pelota', 'Diamante', 'Home-run', 'Lanzador'],
  'Rugby': ['Ovalada', 'Tackle', 'Try', 'Fuerza', 'Equipo'],
  'Ski': ['Nieve', 'Montaña', 'Tablas', 'Velocidad', 'Frío'],
  'Patinaje': ['Hielo', 'Cuchillas', 'Deslizar', 'Elegancia', 'Giros'],
  'Escalada': ['Roca', 'Altura', 'Arnés', 'Fuerza', 'Agarre'],
  'Surf': ['Ola', 'Tabla', 'Playa', 'Equilibrio', 'Mar'],
  'Atletismo': ['Correr', 'Pista', 'Velocidad', 'Salto', 'Medalla'],
  'Karate': ['Kimono', 'Golpes', 'Kata', 'Cinturón', 'Defensa'],
  'Yoga': ['Flexibilidad', 'Postura', 'Respiración', 'Mat', 'Relajación'],
  'CrossFit': ['Intenso', 'Pesas', 'Cardio', 'WOD', 'Fuerza'],
  'Gimnasia': ['Flexibilidad', 'Aparatos', 'Giros', 'Medallas', 'Olímpico'],
  'Esgrima': ['Espada', 'Máscara', 'Estocada', 'Duelo', 'Puntos'],
  'Hockey': ['Disco', 'Palo', 'Hielo', 'Portería', 'Patines'],
  'Badminton': ['Raqueta', 'Pluma', 'Red', 'Golpear', 'Rápido'],
  'Críquet': ['Bat', 'Británico', 'Pelota', 'Wicket', 'Innings'],
  'Ping-Pong': ['Mesa', 'Raqueta', 'Pelota', 'Red', 'Tenis'],
  'Parkour': ['Saltar', 'Urbano', 'Obstáculos', 'Agilidad', 'Muro'],

  // Profesiones
  'Doctor': ['Bata', 'Estetoscopio', 'Pacientes', 'Hospital', 'Medicina'],
  'Profesor': ['Pizarra', 'Estudiantes', 'Enseñar', 'Clase', 'Tarea'],
  'Ingeniero': ['Planos', 'Construcción', 'Diseño', 'Cálculos', 'Obra'],
  'Chef': ['Cocina', 'Sartén', 'Recetas', 'Sabores', 'Gorro'],
  'Piloto': ['Avión', 'Cabina', 'Volar', 'Altura', 'Licencia'],
  'Arquitecto': ['Diseño', 'Edificios', 'Planos', 'Estructura', 'Construcción'],
  'Abogado': ['Leyes', 'Juzgado', 'Defender', 'Toga', 'Casos'],
  'Músico': ['Instrumentos', 'Melodía', 'Ritmo', 'Concierto', 'Notas'],
  'Actor': ['Escenario', 'Personaje', 'Película', 'Actuar', 'Cámara'],
  'Diseñador': ['Creatividad', 'Colores', 'Photoshop', 'Arte', 'Moda'],
  'Periodista': ['Noticias', 'Entrevista', 'Micrófono', 'Reportar', 'Prensa'],
  'Fotógrafo': ['Cámara', 'Lente', 'Flash', 'Sesión', 'Revelar'],
  'Policía': ['Uniforme', 'Orden', 'Patrullar', 'Placa', 'Sirena'],
  'Bombero': ['Fuego', 'Manguera', 'Rescate', 'Casco', 'Sirena'],
  'Científico': ['Laboratorio', 'Experimentos', 'Bata', 'Investigar', 'Microscopio'],
  'Artista': ['Creatividad', 'Pincel', 'Lienzo', 'Expresión', 'Galería'],
  'Programador': ['Código', 'Computadora', 'Debug', 'Algoritmo', 'Café'],
  'Dentista': ['Dientes', 'Consultorio', 'Caries', 'Limpieza', 'Sonrisa'],
  'Veterinario': ['Animales', 'Clínica', 'Curar', 'Mascotas', 'Vacunas'],
  'Escritor': ['Palabras', 'Libro', 'Imaginación', 'Publicar', 'Historia'],
  'Barbero': ['Cortar', 'Tijeras', 'Cabello', 'Espejo', 'Navaja'],
  'Electricista': ['Cables', 'Voltaje', 'Herramientas', 'Instalación', 'Corriente'],
  'Carpintero': ['Madera', 'Sierra', 'Martillo', 'Muebles', 'Aserrín'],
  'Enfermero': ['Hospital', 'Inyección', 'Paciente', 'Cuidar', 'Bata'],
  'Astronauta': ['Espacio', 'Nave', 'Traje', 'Luna', 'Gravedad'],

  // Lugares
  'París': ['Torre', 'Francia', 'Romántico', 'Europa', 'Eiffel'],
  'Tokyo': ['Japón', 'Tecnología', 'Anime', 'Sushi', 'Asia'],
  'Nueva York': ['Rascacielos', 'Estados Unidos', 'Taxis', 'Manhattan', 'Libertad'],
  'Londres': ['Inglaterra', 'Té', 'Big Ben', 'Lluvia', 'Buckingham'],
  'Roma': ['Italia', 'Coliseo', 'Historia', 'Pizza', 'Vaticano'],
  'Barcelona': ['España', 'Gaudí', 'Playa', 'Cataluña', 'Ramblas'],
  'Dubai': ['Emiratos', 'Rascacielos', 'Desierto', 'Lujo', 'Burj'],
  'Sídney': ['Australia', 'Ópera', 'Playa', 'Bahía', 'Canguro'],
  'Ámsterdam': ['Holanda', 'Canales', 'Bicicletas', 'Tulipanes', 'Puentes'],
  'Berlín': ['Alemania', 'Muro', 'Historia', 'Europa', 'Puerta'],
  'Desierto': ['Arena', 'Calor', 'Seco', 'Cactus', 'Dunas'],
  'Selva': ['Verde', 'Húmedo', 'Animales', 'Árboles', 'Densa'],
  'Ciudad': ['Edificios', 'Gente', 'Calles', 'Urbano', 'Tráfico'],
  'Campo': ['Rural', 'Tranquilo', 'Verde', 'Aire', 'Naturaleza'],
  'Isla': ['Agua', 'Rodeada', 'Playa', 'Palmeras', 'Aislada'],
  'Bosque': ['Árboles', 'Verde', 'Animales', 'Naturaleza', 'Aire'],
  'Lago': ['Agua', 'Dulce', 'Pescar', 'Calma', 'Reflejo'],
  'Río': ['Agua', 'Corriente', 'Peces', 'Puente', 'Fluir'],
  'Aeropuerto': ['Aviones', 'Vuelos', 'Terminal', 'Equipaje', 'Despegar'],
  'Museo': ['Arte', 'Historia', 'Cuadros', 'Cultura', 'Exhibición'],
  'Estadio': ['Deporte', 'Gradas', 'Partido', 'Multitud', 'Campo'],
  'Hotel': ['Habitaciones', 'Alojamiento', 'Recepción', 'Camas', 'Servicio'],
  'Universidad': ['Estudiar', 'Título', 'Campus', 'Profesor', 'Carrera'],
  'Mercado': ['Comprar', 'Productos', 'Vender', 'Puestos', 'Gente'],
  'Castillo': ['Medieval', 'Torre', 'Piedra', 'Rey', 'Murallas'],

  // Objetos
  'Paraguas': ['Lluvia', 'Abrir', 'Proteger', 'Mojado', 'Varillas'],
  'Llave': ['Puerta', 'Cerradura', 'Abrir', 'Metal', 'Dientes'],
  'Linterna': ['Luz', 'Oscuridad', 'Batería', 'Noche', 'LED'],
  'Maleta': ['Viaje', 'Ropa', 'Ruedas', 'Equipaje', 'Asa'],
  'Mochila': ['Espalda', 'Cargar', 'Escuela', 'Cremallera', 'Bolsillos'],
  'Gafas': ['Vista', 'Lentes', 'Ojos', 'Montura', 'Graduar'],
  'Sombrero': ['Cabeza', 'Sol', 'Ala', 'Cubrirse', 'Moda'],
  'Bufanda': ['Cuello', 'Frío', 'Lana', 'Abrigar', 'Invierno'],
  'Guantes': ['Manos', 'Frío', 'Par', 'Dedos', 'Abrigar'],
  'Cinturón': ['Pantalón', 'Hebilla', 'Cintura', 'Ajustar', 'Cuero'],
  'Bolígrafo': ['Escribir', 'Tinta', 'Azul', 'Papel', 'Click'],
  'Cuaderno': ['Hojas', 'Escribir', 'Anillos', 'Espiral', 'Apuntes'],
  'Tijeras': ['Cortar', 'Filo', 'Par', 'Metal', 'Papel'],
  'Martillo': ['Golpear', 'Clavos', 'Mango', 'Metal', 'Construcción'],
  'Destornillador': ['Tornillos', 'Girar', 'Punta', 'Herramienta', 'Phillips'],
  'Espejo': ['Reflejo', 'Vidrio', 'Imagen', 'Verse', 'Marco'],
  'Cepillo': ['Cabello', 'Peinar', 'Cerdas', 'Desenredar', 'Mango'],
  'Peine': ['Cabello', 'Dientes', 'Peinar', 'Plástico', 'Bolsillo'],
  'Toalla': ['Secar', 'Baño', 'Suave', 'Algodón', 'Húmedo'],
  'Almohada': ['Cama', 'Dormir', 'Cabeza', 'Suave', 'Plumas'],
  'Tablet': ['Táctil', 'Grande', 'Portátil', 'Pantalla', 'Apps'],
  'Reloj': ['Hora', 'Manecillas', 'Alarma', 'Pulsera', 'Digital'],
  'Drone': ['Volar', 'Cámara', 'Control', 'Hélices', 'Aéreo'],
  'Radio': ['Música', 'Estaciones', 'FM', 'Antena', 'Transistor'],
  'Cámara GoPro': ['Video', 'Deportes', 'Pequeña', 'Acción', 'Impermeable'],

  // Películas
  'Titanic': ['Barco', 'Hundimiento', 'Romance', 'Iceberg', 'Leo'],
  'Avatar': ['Azul', 'Pandora', 'Aliens', '3D', 'Cameron'],
  'Star Wars': ['Espacio', 'Sables', 'Fuerza', 'Galaxia', 'Jedi'],
  'Harry Potter': ['Magia', 'Varita', 'Colegio', 'Bruja', 'Cicatriz'],
  'Matrix': ['Virtual', 'Píldora', 'Neo', 'Realidad', 'Código'],
  'Inception': ['Sueños', 'Niveles', 'Trompo', 'Mente', 'DiCaprio'],
  'Interestelar': ['Espacio', 'Agujero', 'Tiempo', 'Cooper', 'Nave'],
  'Gladiador': ['Roma', 'Arena', 'Espada', 'Lucha', 'Russell'],
  'Rocky': ['Boxeo', 'Escaleras', 'Campeón', 'Filadelfia', 'Stallone'],
  'Alien': ['Espacio', 'Nave', 'Monstruo', 'Terror', 'Sigourney'],
  'Terminator': ['Robot', 'Futuro', 'Arnold', 'Viaje', 'Máquina'],
  'Jurassic Park': ['Dinosaurios', 'Isla', 'Parque', 'ADN', 'T-Rex'],
  'Spider-Man': ['Telaraña', 'Trepar', 'Araña', 'Nueva York', 'Peter'],
  'Batman': ['Murciélago', 'Cueva', 'Millonario', 'Gotham', 'Bruce'],
  'Superman': ['Capa', 'Volar', 'S', 'Krypton', 'Clark'],
  'Iron Man': ['Armadura', 'Tecnología', 'Rico', 'Rojo', 'Tony'],
  'Frozen': ['Hielo', 'Hermanas', 'Nieve', 'Canción', 'Elsa'],
  'Toy Story': ['Juguetes', 'Vivos', 'Andy', 'Woody', 'Buzz'],
  'Shrek': ['Ogro', 'Pantano', 'Burro', 'Verde', 'Fiona'],
  'Coco': ['México', 'Muertos', 'Música', 'Guitarra', 'Miguel'],
  'Up': ['Globos', 'Casa', 'Aventura', 'Anciano', 'Volar'],
  'Los Increíbles': ['Familia', 'Superhéroes', 'Traje', 'Poderes', 'Rojo'],
  'Kung Fu Panda': ['Oso', 'Artes', 'Gordo', 'Noodles', 'Po'],
  'Soul': ['Jazz', 'Música', 'Alma', 'Piano', 'Nueva York'],
  'WALL-E': ['Robot', 'Tierra', 'Basura', 'Solitario', 'Espacio'],

  // Videojuegos
  'Mario': ['Fontanero', 'Saltar', 'Hongos', 'Princesa', 'Bigote'],
  'Zelda': ['Link', 'Espada', 'Triforce', 'Aventura', 'Hyrule'],
  'Fortnite': ['Battle', 'Construcción', 'Baile', 'Armas', 'Royale'],
  'Minecraft': ['Bloques', 'Construcción', 'Creeper', 'Pixelado', 'Minar'],
  'Halo': ['Spartano', 'Espacio', 'Casco', 'Aliens', 'Master'],
  'Call of Duty': ['Guerra', 'Armas', 'Soldados', 'Shooter', 'Multijugador'],
  'FIFA': ['Fútbol', 'Equipos', 'Partido', 'Jugadores', 'EA'],
  'League of Legends': ['MOBA', 'Campeones', 'Torres', 'Estrategia', 'Riot'],
  'Overwatch': ['Héroes', 'Shooter', 'Equipo', 'Habilidades', 'Blizzard'],
  'Valorant': ['Agentes', 'Táctico', 'Shooter', 'Habilidades', 'Riot'],
  'Pokémon': ['Capturar', 'Entrenador', 'Pokébola', 'Evolución', 'Pikachu'],
  'Sonic': ['Azul', 'Velocidad', 'Anillos', 'Erizo', 'Correr'],
  'God of War': ['Kratos', 'Mitología', 'Hacha', 'Guerrero', 'Espartano'],
  'GTA': ['Ciudad', 'Autos', 'Robar', 'Libre', 'Crimen'],
  'Red Dead Redemption': ['Vaquero', 'Oeste', 'Caballo', 'Arthur', 'Pistolas'],
  'The Sims': ['Simulación', 'Vida', 'Casa', 'Construir', 'Personaje'],
  'Apex Legends': ['Battle', 'Leyendas', 'Escuadra', 'Shooter', 'Respawn'],
  'Fall Guys': ['Obstáculos', 'Competir', 'Gracioso', 'Batalla', 'Colores'],
  'Among Us': ['Impostor', 'Tripulantes', 'Tareas', 'Votar', 'Nave'],
  'Elden Ring': ['Difícil', 'Fantasía', 'Jefe', 'Mundo', 'Almas'],

  // Música
  'Guitarra': ['Cuerdas', 'Música', 'Acordes', 'Amplificador', 'Rockero'],
  'Piano': ['Teclas', 'Blanco', 'Negro', 'Clásico', 'Pedales'],
  'Batería': ['Golpear', 'Ritmo', 'Palillos', 'Platillos', 'Bombo'],
  'Violín': ['Arco', 'Cuerdas', 'Clásico', 'Orquesta', 'Barbilla'],
  'Trompeta': ['Viento', 'Metal', 'Jazz', 'Soplar', 'Válvulas'],
  'Flauta': ['Viento', 'Soplar', 'Agujeros', 'Dulce', 'Larga'],
  'Saxofón': ['Jazz', 'Metal', 'Soplar', 'Curvo', 'Blues'],
  'DJ': ['Mezclar', 'Tornamesa', 'Fiesta', 'Música', 'Audífonos'],
  'Cantante': ['Voz', 'Micrófono', 'Letras', 'Canción', 'Melodía'],
  'Banda': ['Grupo', 'Instrumentos', 'Concierto', 'Músicos', 'Tocar'],
  'Ópera': ['Teatro', 'Voz', 'Clásico', 'Soprano', 'Drama'],
  'Rock': ['Guitarras', 'Energía', 'Rebelde', 'Concierto', 'Amplificador'],
  'Pop': ['Radio', 'Popular', 'Comercial', 'Pegajoso', 'Charts'],
  'Salsa': ['Bailar', 'Latino', 'Ritmo', 'Clave', 'Timba'],
  'Reggaetón': ['Latino', 'Urbano', 'Perreo', 'Dembow', 'Bailar'],
  'Rap': ['Rimas', 'Flow', 'Beat', 'Urbano', 'Freestyle'],
  'Jazz': ['Improvisación', 'Saxofón', 'Swing', 'Blues', 'Elegante'],
  'Blues': ['Guitarra', 'Sentimiento', 'Triste', 'Blues', 'Lento'],
  'Metal': ['Pesado', 'Distorsión', 'Intenso', 'Headbang', 'Riffs'],
  'Indie': ['Independiente', 'Alternativo', 'Guitarra', 'Moderno', 'Hipster'],

  // Transporte
  'Carro': ['Motor', 'Ruedas', 'Conducir', 'Gasolina', 'Volante'],
  'Moto': ['Velocidad', 'Casco', 'Ruedas', 'Motor', 'Escape'],
  'Avión': ['Volar', 'Alas', 'Aeropuerto', 'Cielo', 'Turbina'],
  'Barco': ['Agua', 'Vela', 'Puerto', 'Navegar', 'Ancla'],
  'Tren': ['Rieles', 'Vagones', 'Estación', 'Locomotora', 'Silbato'],
  'Autobús': ['Pasajeros', 'Paradas', 'Público', 'Grande', 'Ruta'],
  'Taxi': ['Amarillo', 'Tarifa', 'Conductor', 'Ciudad', 'Llamar'],
  'Helicóptero': ['Rotor', 'Volar', 'Hélices', 'Rescate', 'Aterrizar'],
  'Submarino': ['Agua', 'Sumergir', 'Periscopio', 'Profundo', 'Naval'],
  'Tranvía': ['Rieles', 'Eléctrico', 'Ciudad', 'Pasajeros', 'Cable'],
  'Patineta': ['Ruedas', 'Tabla', 'Trucos', 'Parque', 'Ollie'],
  'Scooter': ['Eléctrico', 'Parado', 'Ciudad', 'Ruedas', 'Manubrio'],
  'Camión': ['Grande', 'Carga', 'Pesado', 'Trailer', 'Diesel'],
  'Bicicleta eléctrica': ['Pedales', 'Batería', 'Asistencia', 'Ecológica', 'Motor'],
  'Cohete': ['Espacio', 'Despegar', 'Propulsión', 'NASA', 'Luna'],

  // Tecnología
  'Smartphone': ['Táctil', 'Aplicaciones', 'Llamadas', 'Internet', 'Cámara'],
  'Laptop': ['Portátil', 'Teclado', 'Batería', 'Pantalla', 'Bisagra'],
  'Smartwatch': ['Muñeca', 'Notificaciones', 'Fitness', 'Hora', 'Táctil'],
  'Tablet': ['Táctil', 'Grande', 'Portátil', 'Pantalla', 'Apps'],
  'Router': ['WiFi', 'Internet', 'Señal', 'Antenas', 'Red'],
  'Dron': ['Volar', 'Cámara', 'Control', 'Hélices', 'Aéreo'],
  'Cámara digital': ['Fotos', 'Lente', 'Sensor', 'Memoria', 'Zoom'],
  'Micrófono': ['Grabar', 'Voz', 'Audio', 'Sonido', 'Espuma'],
  'Auriculares': ['Música', 'Oídos', 'Cable', 'Sonido', 'Bluetooth'],
  'Impresora': ['Papel', 'Tinta', 'Imprimir', 'Documentos', 'Escáner'],
  'Servidor': ['Datos', 'Red', 'Hosting', 'Procesamiento', 'Cloud'],
  'Consola': ['Videojuegos', 'Mando', 'TV', 'Jugar', 'HDMI'],
  'USB': ['Puerto', 'Memoria', 'Datos', 'Transferir', 'Stick'],
  'Monitor': ['Pantalla', 'Resolución', 'Píxeles', 'HDMI', 'Desk'],
  'VR': ['Virtual', 'Gafas', 'Inmersivo', 'Realidad', '3D'],

  // Sentimientos
  'Alegría': ['Sonrisa', 'Feliz', 'Positivo', 'Reír', 'Contento'],
  'Enojo': ['Rojo', 'Gritar', 'Frustración', 'Molesto', 'Ira'],
  'Miedo': ['Susto', 'Temblar', 'Oscuridad', 'Peligro', 'Pánico'],
  'Tristeza': ['Lágrimas', 'Llorar', 'Gris', 'Nostalgia', 'Melancólico'],
  'Vergüenza': ['Sonrojo', 'Rojo', 'Pena', 'Bajar', 'Esconder'],
  'Amor': ['Corazón', 'Rojo', 'Abrazo', 'Beso', 'Pareja'],
  'Ansiedad': ['Nervioso', 'Preocupación', 'Estrés', 'Tensión', 'Agobio'],
  'Orgullo': ['Logro', 'Satisfacción', 'Éxito', 'Pecho', 'Digno'],
  'Confianza': ['Seguro', 'Creer', 'Firme', 'Certeza', 'Fe'],
  'Nostalgia': ['Pasado', 'Recuerdos', 'Añoranza', 'Melancolía', 'Ayer'],

  // Naturaleza
  'Volcán': ['Lava', 'Erupción', 'Calor', 'Montaña', 'Magma'],
  'Tornado': ['Viento', 'Espiral', 'Destrucción', 'Cielo', 'Embudo'],
  'Huracán': ['Viento', 'Lluvia', 'Ojo', 'Tormenta', 'Categoría'],
  'Arcoíris': ['Colores', 'Lluvia', 'Sol', 'Cielo', 'Arco'],
  'Lago': ['Agua', 'Dulce', 'Pescar', 'Calma', 'Reflejo'],
  'Montaña': ['Alto', 'Escalada', 'Cumbre', 'Nieve', 'Pico'],
  'Río': ['Agua', 'Corriente', 'Peces', 'Puente', 'Fluir'],
  'Cascada': ['Agua', 'Caer', 'Altura', 'Ruido', 'Neblina'],
  'Valle': ['Bajo', 'Montañas', 'Verde', 'Fértil', 'Río'],
  'Glaciar': ['Hielo', 'Frío', 'Azul', 'Derretir', 'Polar'],
  'Desierto': ['Arena', 'Calor', 'Seco', 'Cactus', 'Dunas'],
  'Cueva': ['Oscura', 'Roca', 'Estalagmitas', 'Murciélagos', 'Subterránea'],

  // Colores
  'Rojo': ['Fuego', 'Pasión', 'Sangre', 'Rosa', 'Fresa'],
  'Azul': ['Cielo', 'Mar', 'Calma', 'Frío', 'Marino'],
  'Verde': ['Naturaleza', 'Esperanza', 'Plantas', 'Esmeralda', 'Lima'],
  'Amarillo': ['Sol', 'Alegre', 'Brillante', 'Oro', 'Limón'],
  'Morado': ['Realeza', 'Violeta', 'Lavanda', 'Uva', 'Místico'],
  'Naranja': ['Fruta', 'Cálido', 'Otoño', 'Vibrante', 'Zanahoria'],
  'Rosa': ['Dulce', 'Femenino', 'Suave', 'Flor', 'Chicle'],
  'Negro': ['Oscuro', 'Noche', 'Elegante', 'Carbón', 'Sombra'],
  'Blanco': ['Pureza', 'Nieve', 'Paz', 'Luz', 'Limpio'],
  'Gris': ['Neutral', 'Nublado', 'Sutil', 'Plata', 'Piedra'],
  'Cian': ['Agua', 'Eléctrico', 'Brillante', 'Tropical', 'Neón'],
  'Marrón': ['Tierra', 'Madera', 'Café', 'Otoño', 'Chocolate'],

  // Superhéroes
  'Superman': ['Capa', 'Volar', 'S', 'Krypton', 'Clark'],
  'Batman': ['Murciélago', 'Cueva', 'Millonario', 'Gotham', 'Bruce'],
  'Spider-Man': ['Telaraña', 'Trepar', 'Araña', 'Sentido', 'Peter'],
  'Iron Man': ['Armadura', 'Tecnología', 'Rico', 'Rojo', 'Tony'],
  'Hulk': ['Verde', 'Fuerza', 'Enojo', 'Grande', 'Bruce'],
  'Thor': ['Martillo', 'Trueno', 'Asgard', 'Dios', 'Nórdico'],
  'Capitán América': ['Escudo', 'Estrella', 'Soldado', 'Líder', 'Steve'],
  'Black Widow': ['Espía', 'Agente', 'Roja', 'Pelea', 'Natasha'],
  'Flash': ['Velocidad', 'Rayo', 'Rápido', 'Rojo', 'Barry'],
  'Wolverine': ['Garras', 'Regeneración', 'X-Men', 'Adamantium', 'Logan'],
  'Doctor Strange': ['Magia', 'Hechizos', 'Capa', 'Místico', 'Stephen'],
  'Aquaman': ['Océano', 'Tridente', 'Peces', 'Atlántida', 'Arthur'],
  'Deadpool': ['Regeneración', 'Rojo', 'Sarcástico', 'Espadas', 'Wade'],

  // Series
  'Game of Thrones': ['Dragones', 'Trono', 'Invierno', 'Espadas', 'Westeros'],
  'Breaking Bad': ['Química', 'Metanfetamina', 'Desierto', 'RV', 'Walter'],
  'Stranger Things': ['Ochentas', 'Monstruo', 'Niños', 'Dimensión', 'Hawkins'],
  'Friends': ['Café', 'Apartamento', 'Grupo', 'Comedia', 'Central'],
  'The Office': ['Papel', 'Oficina', 'Michael', 'Mockumentary', 'Dunder'],
  'Sherlock': ['Detective', 'Londres', 'Deducción', 'Watson', 'Holmes'],
  'Narcos': ['Drogas', 'Colombia', 'Pablo', 'DEA', 'Cartel'],
  'Dark': ['Alemana', 'Tiempo', 'Cueva', 'Misterio', 'Loops'],
  'Vikings': ['Nórdicos', 'Barcos', 'Guerreros', 'Ragnar', 'Invasión'],
  'The Mandalorian': ['Star Wars', 'Cazarrecompensas', 'Grogu', 'Casco', 'Beskar'],
  'Rick and Morty': ['Ciencia', 'Portales', 'Dimensiones', 'Abuelo', 'Nieto'],

  // Instrumentos (duplicado con música pero añadiendo más)
  'Piano': ['Teclas', 'Blanco', 'Negro', 'Clásico', 'Pedales'],
  'Guitarra': ['Cuerdas', 'Música', 'Acordes', 'Amplificador', 'Rockero'],
  'Batería': ['Golpear', 'Ritmo', 'Palillos', 'Platillos', 'Bombo'],
  'Trompeta': ['Viento', 'Metal', 'Jazz', 'Soplar', 'Válvulas'],
  'Violín': ['Arco', 'Cuerdas', 'Clásico', 'Orquesta', 'Barbilla'],
  'Flauta': ['Viento', 'Soplar', 'Agujeros', 'Dulce', 'Larga'],
  'Saxofón': ['Jazz', 'Metal', 'Soplar', 'Curvo', 'Blues'],
  'Ukulele': ['Hawaiano', 'Cuerdas', 'Pequeño', 'Playa', 'Alegre'],
  'Bajo': ['Cuerdas', 'Grave', 'Eléctrico', 'Ritmo', 'Bajo'],
  'Arpa': ['Cuerdas', 'Ángel', 'Clásico', 'Grande', 'Dorado'],

  // Emociones (adicionales)
  'Felicidad': ['Sonrisa', 'Alegre', 'Positivo', 'Euforia', 'Gozo'],
  'Rabia': ['Rojo', 'Explosivo', 'Ira', 'Furioso', 'Enojo'],
  'Calma': ['Paz', 'Tranquilo', 'Relajado', 'Sereno', 'Quieto'],
  'Sorpresa': ['Inesperado', 'Asombro', 'Ojos', 'Wow', 'Sorpresa'],
  'Agotamiento': ['Cansancio', 'Fatiga', 'Exhausto', 'Energía', 'Dormir'],
  'Entusiasmo': ['Emoción', 'Energía', 'Pasión', 'Motivación', 'Alegría'],
  'Confusión': ['Perdido', 'Dudas', 'Interrogación', 'Desorientado', 'Lío'],
  'Envidia': ['Verde', 'Querer', 'Celos', 'Deseo', 'Comparación'],
  'Terror': ['Miedo', 'Horror', 'Pánico', 'Gritar', 'Extremo'],
  'Paz': ['Tranquilidad', 'Armonía', 'Calma', 'Serenidad', 'Blanco'],

  // Ropa
  'Camiseta': ['Manga', 'Algodón', 'Pecho', 'Casual', 'Talla'],
  'Pantalón': ['Piernas', 'Bolsillos', 'Cintura', 'Tela', 'Cremallera'],
  'Zapatos': ['Pies', 'Suela', 'Caminar', 'Par', 'Atar'],
  'Gorra': ['Cabeza', 'Visera', 'Sol', 'Béisbol', 'Logo'],
  'Chaqueta': ['Abrigo', 'Cremallera', 'Mangas', 'Frío', 'Botones'],
  'Falda': ['Cintura', 'Femenina', 'Tela', 'Vuelo', 'Moda'],
  'Vestido': ['Mujer', 'Elegante', 'Fiesta', 'Tela', 'Largo'],
  'Sandalias': ['Abierto', 'Verano', 'Correas', 'Playa', 'Pies'],
  'Botas': ['Altas', 'Cuero', 'Suela', 'Invierno', 'Cordones'],
  'Guantes': ['Manos', 'Frío', 'Par', 'Dedos', 'Abrigar'],

  // Herramientas
  'Martillo': ['Golpear', 'Clavos', 'Mango', 'Metal', 'Construcción'],
  'Taladro': ['Perforar', 'Broca', 'Eléctrico', 'Agujeros', 'Ruido'],
  'Destornillador': ['Tornillos', 'Girar', 'Punta', 'Herramienta', 'Phillips'],
  'Llave inglesa': ['Ajustar', 'Tuercas', 'Metal', 'Girar', 'Plomería'],
  'Sierra': ['Cortar', 'Madera', 'Dientes', 'Filo', 'Serrucho'],
  'Alicate': ['Agarre', 'Pinzas', 'Metal', 'Cortar', 'Sujetar'],
  'Cuter': ['Cortar', 'Filo', 'Retráctil', 'Cuchilla', 'Papel'],
  'Nivel': ['Recto', 'Burbuja', 'Construcción', 'Horizontal', 'Nivelar'],
  'Lijadora': ['Suavizar', 'Madera', 'Papel', 'Pulir', 'Eléctrica'],
  'Soldador': ['Calor', 'Estaño', 'Unir', 'Metal', 'Punta'],

  // Ciencia
  'Átomo': ['Pequeño', 'Partícula', 'Núcleo', 'Electrones', 'Física'],
  'Molécula': ['Átomos', 'Química', 'Enlace', 'Compuesto', 'Estructura'],
  'Energía': ['Fuerza', 'Trabajo', 'Potencia', 'Conservación', 'Cinética'],
  'Gravedad': ['Caída', 'Peso', 'Tierra', 'Atracción', 'Newton'],
  'Planeta': ['Órbita', 'Espacio', 'Sol', 'Redondo', 'Sistema'],
  'Bacteria': ['Microorganismo', 'Célula', 'Pequeña', 'Infección', 'Microscópica'],
  'Virus': ['Infección', 'Pequeño', 'Célula', 'Enfermedad', 'Vacuna'],
  'Evolución': ['Especies', 'Adaptación', 'Darwin', 'Tiempo', 'Natural'],
  'Fotosíntesis': ['Plantas', 'Sol', 'Clorofila', 'Oxígeno', 'Verde'],
  'ADN': ['Genética', 'Doble', 'Hélice', 'Información', 'Células'],

  // Astrología
  'Aries': ['Carnero', 'Fuego', 'Marzo', 'Primero', 'Impulsivo'],
  'Tauro': ['Toro', 'Tierra', 'Abril', 'Terco', 'Venus'],
  'Géminis': ['Gemelos', 'Aire', 'Mayo', 'Dual', 'Comunicación'],
  'Cáncer': ['Cangrejo', 'Agua', 'Junio', 'Emocional', 'Luna'],
  'Leo': ['León', 'Fuego', 'Julio', 'Orgulloso', 'Sol'],
  'Virgo': ['Virgen', 'Tierra', 'Agosto', 'Perfeccionista', 'Mercurio'],
  'Libra': ['Balanza', 'Aire', 'Septiembre', 'Equilibrio', 'Venus'],
  'Escorpio': ['Escorpión', 'Agua', 'Octubre', 'Intenso', 'Plutón'],
  'Sagitario': ['Arquero', 'Fuego', 'Noviembre', 'Aventurero', 'Júpiter'],
  'Capricornio': ['Cabra', 'Tierra', 'Diciembre', 'Ambicioso', 'Saturno'],
  'Acuario': ['Aguador', 'Aire', 'Enero', 'Original', 'Urano'],
  'Piscis': ['Pez', 'Agua', 'Febrero', 'Soñador', 'Neptuno'],

  // Juguetes
  'Yoyo': ['Cuerda', 'Subir', 'Bajar', 'Trucos', 'Disco'],
  'Lego': ['Bloques', 'Construcción', 'Plástico', 'Conectar', 'Danés'],
  'Pelota saltarina': ['Botar', 'Rebote', 'Goma', 'Saltar', 'Redonda'],
  'Muñeco': ['Jugar', 'Plástico', 'Articulado', 'Colección', 'Figura'],
  'Carrito': ['Ruedas', 'Juguete', 'Empujar', 'Niño', 'Miniatura'],
  'Nerf': ['Espuma', 'Dardos', 'Seguro', 'Disparar', 'Naranja'],
  'Cubos': ['Apilar', 'Construcción', 'Colores', 'Bebé', 'Bloques'],
  'Rompecabezas': ['Piezas', 'Armar', 'Imagen', 'Paciencia', 'Puzzle'],
  'Slime': ['Viscoso', 'Pegajoso', 'Elástico', 'Verde', 'Jugar'],
  'Burbuja': ['Jabón', 'Soplar', 'Flotar', 'Redonda', 'Reventar'],
  'Cometa': ['Volar', 'Viento', 'Hilo', 'Cielo', 'Cola'],
  'Trampolín': ['Saltar', 'Rebotar', 'Diversión', 'Altura', 'Lona'],
  'Pistola de agua': ['Disparar', 'Verano', 'Mojar', 'Llenar', 'Jugar'],
  'Peluche': ['Suave', 'Abrazo', 'Animal', 'Oso', 'Felpa'],
  'Hula Hula': ['Aro', 'Girar', 'Cintura', 'Plástico', 'Equilibrio'],

  // Electrodomésticos
  'Microondas': ['Calentar', 'Rápido', 'Radiación', 'Beep', 'Plato'],
  'Licuadora': ['Mezclar', 'Cuchillas', 'Frutas', 'Ruido', 'Smoothie'],
  'Aspiradora': ['Succionar', 'Piso', 'Polvo', 'Ruido', 'Bolsa'],
  'Plancha': ['Ropa', 'Calor', 'Arrugas', 'Vapor', 'Alisar'],
  'Tostadora': ['Pan', 'Caliente', 'Dorar', 'Ranuras', 'Expulsar'],
  'Ventilador': ['Aire', 'Aspas', 'Girar', 'Fresco', 'Velocidad'],
  'Horno': ['Cocinar', 'Calor', 'Hornear', 'Temperatura', 'Puerta'],
  'Lavadora': ['Ropa', 'Agua', 'Detergente', 'Ciclo', 'Tambor'],
  'Secadora': ['Ropa', 'Calor', 'Secar', 'Tambor', 'Centrifugar'],
  'Freidora de aire': ['Cocinar', 'Aire', 'Caliente', 'Saludable', 'Crujiente'],
  'Cafetera': ['Café', 'Filtro', 'Agua', 'Mañana', 'Taza'],
  'Batidora': ['Mezclar', 'Varillas', 'Masa', 'Batir', 'Repostería'],
  'Refrigerador': ['Frío', 'Comida', 'Puerta', 'Luz', 'Congelar'],

  // Fiestas
  'Globos': ['Aire', 'Helio', 'Colores', 'Reventar', 'Decoración'],
  'Piñata': ['Golpear', 'Dulces', 'Palo', 'Romper', 'Vendados'],
  'Pastel': ['Cumpleaños', 'Velas', 'Dulce', 'Rebanadas', 'Betún'],
  'Velas': ['Fuego', 'Soplar', 'Cumpleaños', 'Deseo', 'Cera'],
  'Confeti': ['Papelitos', 'Colores', 'Tirar', 'Celebración', 'Limpieza'],
  'Serpentina': ['Papel', 'Enrollada', 'Colores', 'Lanzar', 'Decoración'],
  'Disfraz': ['Halloween', 'Vestir', 'Personaje', 'Carnaval', 'Máscara'],
  'Payaso': ['Nariz', 'Roja', 'Risas', 'Maquillaje', 'Globos'],
  'Cotillón': ['Fiesta', 'Decoración', 'Gorros', 'Matracas', 'Colorido'],
  'Música': ['Canción', 'Bailar', 'Ritmo', 'Fiesta', 'Volumen'],
  'Maracas': ['Agitar', 'Semillas', 'Sonido', 'Latino', 'Ritmo'],
  'Bongos': ['Tambor', 'Golpear', 'Par', 'Ritmo', 'Latino'],
  'Sombrero de fiesta': ['Cono', 'Elástico', 'Cumpleaños', 'Papel', 'Puntiagudo'],
  'Regalos': ['Envuelto', 'Sorpresa', 'Moño', 'Cumpleaños', 'Abrir'],

  // Escuela
  'Pupitre': ['Mesa', 'Estudiante', 'Sentarse', 'Madera', 'Clase'],
  'Mochila': ['Libros', 'Espalda', 'Útiles', 'Cremallera', 'Cargar'],
  'Tiza': ['Escribir', 'Blanco', 'Pizarra', 'Polvo', 'Rayar'],
  'Pizarra': ['Escribir', 'Tiza', 'Verde', 'Borrar', 'Frontal'],
  'Libro': ['Páginas', 'Leer', 'Portada', 'Texto', 'Estudiar'],
  'Lonchera': ['Comida', 'Recreo', 'Cargar', 'Almuerzo', 'Portátil'],
  'Examen': ['Prueba', 'Calificación', 'Estudiar', 'Nervios', 'Preguntas'],
  'Recreo': ['Descanso', 'Jugar', 'Patio', 'Amigos', 'Timbre'],
  'Profesor': ['Enseñar', 'Clase', 'Explicar', 'Estudiantes', 'Maestro'],
  'Borrador': ['Limpiar', 'Pizarra', 'Tiza', 'Polvo', 'Goma'],
  'Cuaderno': ['Hojas', 'Escribir', 'Anillos', 'Espiral', 'Apuntes'],
  'Tijeras': ['Cortar', 'Filo', 'Par', 'Metal', 'Papel'],
  'Pegante': ['Pegar', 'Adhesivo', 'Blanco', 'Líquido', 'Tubo'],
  'Regla': ['Medir', 'Centímetros', 'Recta', 'Líneas', 'Plástico'],

  // Fantasía
  'Dragón': ['Fuego', 'Escamas', 'Volar', 'Legendario', 'Alas'],
  'Hada': ['Alas', 'Magia', 'Pequeña', 'Polvo', 'Varita'],
  'Duende': ['Pequeño', 'Verde', 'Bosque', 'Orejas', 'Travieso'],
  'Mago': ['Varita', 'Hechizos', 'Túnica', 'Barba', 'Sombrero'],
  'Unicornio': ['Cuerno', 'Blanco', 'Mágico', 'Caballo', 'Arcoíris'],
  'Bruja': ['Escoba', 'Caldero', 'Gato', 'Sombrero', 'Pócimas'],
  'Elfo': ['Orejas', 'Bosque', 'Arco', 'Ágil', 'Inmortal'],
  'Troll': ['Grande', 'Feo', 'Puente', 'Fuerte', 'Verde'],
  'Gólem': ['Piedra', 'Grande', 'Controlado', 'Fuerte', 'Sin mente'],
  'Hechizo': ['Magia', 'Palabras', 'Efecto', 'Varita', 'Conjurar'],
  'Varita': ['Magia', 'Mago', 'Hechizos', 'Palo', 'Poder'],
  'Grimorio': ['Libro', 'Magia', 'Hechizos', 'Antiguo', 'Secreto'],
  'Pegaso': ['Caballo', 'Alas', 'Volar', 'Blanco', 'Mitología'],
  'Sirena': ['Mar', 'Cola', 'Cantar', 'Pez', 'Mujer'],

  // Memes
  'Gato enojado': ['Felino', 'Ceño', 'Fruncido', 'Viral', 'Grumpy'],
  'Perro Cheems': ['Shiba', 'Fuerte', 'Débil', 'Amarillo', 'Cachetes'],
  'Doge': ['Perro', 'Shiba', 'Wow', 'Meme', 'Cripto'],
  'Shrek sorprendido': ['Ogro', 'Verde', 'Cara', 'Sorpresa', 'Dreamworks'],
  'Meme del ataúd': ['Bailar', 'Ghana', 'Funeral', 'Música', 'Negro'],
  'Spider-Man señalándose': ['Araña', 'Dos', 'Señalar', 'Mismo', 'Igual'],
  'Distracted boyfriend': ['Novio', 'Mirar', 'Otra', 'Distraído', 'Foto'],
  'NPC': ['Personaje', 'Videojuego', 'Repetitivo', 'Robot', 'Programado'],
  'Risa malévola': ['Risas', 'Malvado', 'Plan', 'Muajaja', 'Villano'],
  'Soy ese': ['Confirmar', 'Yo', 'Identificar', 'Ese', 'Sí'],
  'El Pepe': ['Random', 'Absurdo', 'Nombre', 'Ete Sech', 'Gracioso'],

  // Cosas incómodas
  'Silencio incómodo': ['Callado', 'Raro', 'Esperar', 'Tenso', 'Awkward'],
  'Abrazo raro': ['Torpe', 'Incómodo', 'Contacto', 'Extraño', 'Patético'],
  'Apretón débil': ['Mano', 'Flojo', 'Saludo', 'Mojado', 'Pez'],
  'Zapato mojado': ['Pie', 'Húmedo', 'Incómodo', 'Chapotear', 'Squish'],
  'Olor sospechoso': ['Nariz', 'Desagradable', 'Snif', 'Raro', 'Dudar'],
  'Mensaje doble': ['Palomita', 'Visto', 'Esperar', 'WhatsApp', 'Ignorado'],
  'Risa falsa': ['Forzada', 'Ja', 'Fingir', 'Cortés', 'Incómodo'],
  'Selfie fallida': ['Foto', 'Ángulo', 'Malo', 'Borrar', 'Intentar'],
  'Mano sudada': ['Palma', 'Húmeda', 'Nervios', 'Saludo', 'Incómodo'],
  'Nombre equivocado': ['Confundir', 'Llamar', 'Otro', 'Perdón', 'Vergüenza'],
  'Saludo fallido': ['Choque', 'Mano', 'Confusión', 'Beso', 'Torpe'],
  'Pies fríos': ['Helados', 'Cama', 'Invierno', 'Calcetines', 'Congelar'],

  // Actividades random
  'Bailar mal': ['Ritmo', 'Torpe', 'Intentar', 'Vergüenza', 'Gracioso'],
  'Cantar en la ducha': ['Agua', 'Acústica', 'Solo', 'Eco', 'Desafinar'],
  'Perder las llaves': ['Buscar', 'Dónde', 'Frustración', 'Revisar', 'Bolsillos'],
  'Dormir en el bus': ['Cabezazo', 'Viaje', 'Sueño', 'Babear', 'Parada'],
  'Tropezar': ['Caer', 'Piedra', 'Torpe', 'Casi', 'Vergüenza'],
  'Reírse solo': ['Raro', 'Loco', 'Miradas', 'Recuerdo', 'Gracioso'],
  'Hablar con el espejo': ['Reflejon', 'Practicar', 'Solo', 'Conversar', 'Psicópata'],
  'Quemar arroz': ['Cocina', 'Humo', 'Olor', 'Negro', 'Olvidar'],
  'Olvidar el paraguas': ['Lluvia', 'Mojado', 'Perder', 'Típico', 'Casa'],
  'Gritar por un insecto': ['Susto', 'Pequeño', 'Exagerado', 'Volar', 'Araña'],
  'Buscar señal': ['Celular', 'Mover', 'Altura', 'Brazos', 'WiFi'],

  // Palabras raras
  'Chirimbolo': ['Cosa', 'Objeto', 'Raro', 'Desconocido', 'Cachivache'],
  'Guaracha': ['Fiesta', 'Baile', 'Desorden', 'Rumba', 'Alboroto'],
  'Chisguete': ['Líquido', 'Chorro', 'Salpicar', 'Spray', 'Rociar'],
  'Totuma': ['Recipiente', 'Calabaza', 'Vasija', 'Tradicional', 'Beber'],
  'Chanfle': ['Expresión', 'Caramba', 'Chespirito', 'Eufemismo', 'Sorpresa'],
  'Ñáñara': ['Asco', 'Repulsión', 'Fuchi', 'Desagrado', 'Asqueroso'],
  'Baratija': ['Chuchería', 'Objeto', 'Poco valor', 'Adorno', 'Barato'],
  'Cachivache': ['Trasto', 'Objeto', 'Inútil', 'Viejo', 'Guardar'],
  'Trasto': ['Objeto', 'Viejo', 'Inservible', 'Estorbo', 'Desorden'],
  'Zángano': ['Holgazán', 'Flojo', 'Abeja', 'Perezoso', 'Vago'],
  'Pereque': ['Molestia', 'Fastidio', 'Niño', 'Insistente', 'Latoso'],
  'Faramalla': ['Palabrería', 'Engaño', 'Apariencia', 'Cuento', 'Vacío'],
  'Guachafita': ['Desorden', 'Relajo', 'Fiesta', 'Alboroto', 'Caos'],

  // Hogar
  'Sofá': ['Sentarse', 'Sala', 'Cojines', 'Descanso', 'Cómodo'],
  'Cortina': ['Ventana', 'Tela', 'Luz', 'Privacidad', 'Colgar'],
  'Planta': ['Verde', 'Maceta', 'Regar', 'Hojas', 'Decoración'],
  'Zapatero': ['Zapatos', 'Organizar', 'Mueble', 'Entrada', 'Guardar'],
  'Escoba': ['Barrer', 'Limpiar', 'Palo', 'Cerdas', 'Basura'],
  'Trapeador': ['Piso', 'Limpiar', 'Agua', 'Mojado', 'Mechudo'],
  'Estante': ['Libros', 'Madera', 'Organizar', 'Repisas', 'Pared'],
  'Alfombra': ['Piso', 'Suave', 'Decoración', 'Pisada', 'Tejida'],
  'Cojín': ['Sofá', 'Suave', 'Decoración', 'Almohada', 'Tela'],
  'Jarrón': ['Flores', 'Agua', 'Decoración', 'Cerámica', 'Frágil'],
  'Veladora': ['Vela', 'Luz', 'Vidrio', 'Noche', 'Aroma'],

  // Oficina
  'Grapadora': ['Grapas', 'Unir', 'Papeles', 'Presionar', 'Metal'],
  'Archivador': ['Documentos', 'Organizar', 'Carpetas', 'Gavetas', 'Metal'],
  'Teclado': ['Teclas', 'Escribir', 'QWERTY', 'Computadora', 'Enter'],
  'Monitor': ['Pantalla', 'Resolución', 'Píxeles', 'HDMI', 'Desk'],
  'Café frío': ['Olvidado', 'Amargo', 'Taza', 'Calentae', 'Trabajo'],
  'Post-it': ['Notas', 'Adhesivo', 'Amarillo', 'Recordatorio', 'Pegar'],
  'Carpeta': ['Documentos', 'Organizar', 'Cartón', 'Archivos', 'Clasificar'],
  'Agenda': ['Citas', 'Notas', 'Planear', 'Fechas', 'Calendario'],
  'Silla giratoria': ['Rodar', 'Girar', 'Escritorio', 'Ruedas', 'Cómoda'],
  'Clip': ['Papeles', 'Unir', 'Metal', 'Doblar', 'Sujetar'],
  'Portátil': ['Laptop', 'Trabajo', 'Móvil', 'Batería', 'Computadora'],
  'Audífonos': ['Música', 'Oídos', 'Aislamiento', 'Trabajo', 'Sonido'],

  // Clima
  'Granizo': ['Hielo', 'Caer', 'Golpear', 'Frío', 'Bolas'],
  'Neblina': ['Gris', 'Humedad', 'Visibilidad', 'Mañana', 'Denso'],
  'Relámpago': ['Luz', 'Rayo', 'Tormenta', 'Eléctrico', 'Cielo'],
  'Trueno': ['Sonido', 'Estruendo', 'Tormenta', 'Cielo', 'Retumbar'],
  'Llovizna': ['Lluvia', 'Ligera', 'Gotas', 'Fina', 'Húmedo'],
  'Tormenta': ['Lluvia', 'Viento', 'Truenos', 'Fuerte', 'Cielo'],
  'Solazo': ['Sol', 'Calor', 'Intenso', 'Brillante', 'Quemadura'],
  'Frío polar': ['Helado', 'Extremo', 'Temblar', 'Congelar', 'Ártico'],
  'Calor infernal': ['Sofocante', 'Extremo', 'Sudar', 'Agobiante', 'Infierno'],

  // Sonidos
  'Ronquido': ['Dormir', 'Nariz', 'Ruido', 'Molesto', 'Fuerte'],
  'Eructo': ['Gas', 'Boca', 'Grosero', 'Estómago', 'Sonoro'],
  'Aplauso': ['Manos', 'Palmas', 'Aplaudir', 'Felicitar', 'Ovación'],
  'Chasquido': ['Dedos', 'Lengua', 'Sonido', 'Seco', 'Click'],
  'Crujido': ['Madera', 'Huesos', 'Sonido', 'Seco', 'Viejo'],
  'Silbido': ['Labios', 'Aire', 'Melodía', 'Agudo', 'Llamar'],
  'Golpe': ['Impacto', 'Sonido', 'Fuerte', 'Choque', 'Dolor'],
  'Susurro': ['Bajo', 'Secreto', 'Suave', 'Oído', 'Silencioso'],
  'Carcajada': ['Risa', 'Fuerte', 'Alegría', 'Contagiosa', 'Grito'],
  'Bostezo': ['Sueño', 'Abrir', 'Boca', 'Cansancio', 'Contagioso'],

  // Acciones graciosas
  'Resbalar': ['Caer', 'Piso', 'Cáscara', 'Torpe', 'Mojado'],
  'Bailar raro': ['Ritmo', 'Torpe', 'Movimientos', 'Gracioso', 'Vergüenza'],
  'Estornudo explosivo': ['Achís', 'Fuerte', 'Saliva', 'Sorpresa', 'Molestia'],
  'Hablar dormido': ['Sueño', 'Inconsiente', 'Palabras', 'Raro', 'Sonámbulo'],
  'Cantar desafinado': ['Mal', 'Notas', 'Horrible', 'Gallo', 'Vergüenza'],
  'Chocar la mano mal': ['Fallido', 'Torpe', 'Saludo', 'Golpe', 'Awkward'],
  'Gritar por nada': ['Exagerado', 'Susto', 'Fuerte', 'Sorpresa', 'Drama'],
  'Saltar de susto': ['Brinco', 'Miedo', 'Sorpresa', 'Corazón', 'Reacción'],
  'Confundir personas': ['Equivocado', 'Pena', 'Saludar', 'Otro', 'Perdón'],
  'Caer de la silla': ['Resbalón', 'Piso', 'Torpe', 'Dolor', 'Vergüenza'],

  // Transporte ridículo
  'Patineta eléctrica': ['Ruedas', 'Batería', 'Equilibrio', 'Tecnología', 'Urbano'],
  'Zapatillas con ruedas': ['Heelys', 'Deslizar', 'Pies', 'Niños', 'Rodar'],
  'Monociclo': ['Una rueda', 'Equilibrio', 'Circo', 'Difícil', 'Pedal'],
  'Scooter roto': ['Cojo', 'Inservible', 'Rueda', 'Inútil', 'Basura'],
  'Carrito de supermercado': ['Compras', 'Cuatro ruedas', 'Empujar', 'Metal', 'Chueco'],
  'Trencito infantil': ['Niños', 'Parque', 'Lento', 'Diversión', 'Monedas'],
  'Coche de bebé': ['Bebé', 'Empujar', 'Ruedas', 'Pasear', 'Manta'],
  'Triciclo': ['Tres ruedas', 'Niño', 'Estable', 'Pedales', 'Pequeño'],
  'Caballito de madera': ['Balancín', 'Juguete', 'Mecerse', 'Infantil', 'Parque'],

  // Cosas pequeñas
  'Canica': ['Vidrio', 'Redonda', 'Jugar', 'Colores', 'Bolita'],
  'Botón': ['Camisa', 'Redondo', 'Pequeño', 'Coser', 'Ojal'],
  'Moneda': ['Metal', 'Dinero', 'Redonda', 'Cambio', 'Céntimos'],
  'Clip': ['Papeles', 'Metal', 'Unir', 'Doblar', 'Oficina'],
  'Caramelo': ['Dulce', 'Pequeño', 'Azúcar', 'Envuelto', 'Chupar'],
  'Goma de borrar': ['Lápiz', 'Borrar', 'Rosa', 'Frotar', 'Migajas'],
  'Llavero': ['Llaves', 'Decorativo', 'Anillo', 'Bolsillo', 'Colgante'],
  'Ficha de dominó': ['Juego', 'Rectángulo', 'Puntos', 'Blanco', 'Negro'],
  'Ojito móvil': ['Manualidades', 'Mover', 'Pegamento', 'Decoración', 'Gracioso'],
  'Confeti': ['Papelitos', 'Colores', 'Fiesta', 'Tirar', 'Celebración'],

  // Comida rara
  'Sopa fría': ['Líquida', 'Temperatura', 'Gazpacho', 'Extraño', 'Verano'],
  'Huevos verdes': ['Dr Seuss', 'Color', 'Raro', 'Espinaca', 'Extraño'],
  'Pan quemado': ['Negro', 'Amargo', 'Tostadora', 'Error', 'Carbón'],
  'Pizza dulce': ['Azúcar', 'Rara', 'Frutas', 'Chocolate', 'Postre'],
  'Arroz azul': ['Color', 'Raro', 'Colorante', 'Extraño', 'Llamativo'],
  'Tamal gigante': ['Grande', 'Exagerado', 'Masa', 'Enorme', 'Fiesta'],
  'Café salado': ['Horrible', 'Error', 'Sal', 'Amargo', 'Equivocación'],
  'Gelatina extraña': ['Viscosa', 'Rara', 'Sabor', 'Temblorosa', 'Dudosa'],
  'Perro caliente con piña': ['Tropical', 'Raro', 'Hawaiano', 'Combinación', 'Dulce'],

  // Personajes random
  'Señora de los gatos': ['Muchos', 'Solitaria', 'Felinos', 'Locura', 'Casa'],
  'Tío chistoso': ['Bromas', 'Chistes', 'Ruidoso', 'Familia', 'Gracioso'],
  'Vecino misterioso': ['Extraño', 'Raro', 'Desconocido', 'Curioso', 'Secreto'],
  'Niño hiperactivo': ['Energía', 'Correr', 'Saltar', 'Inquieto', 'No parar'],
  'Abuelo sabio': ['Consejos', 'Experiencia', 'Anciano', 'Historias', 'Calma'],
  'Amigo que grita': ['Fuerte', 'Ruidoso', 'Escandaloso', 'Volumen', 'Oídos'],
  'Persona demasiado feliz': ['Alegre', 'Sonrisa', 'Energía', 'Sospechoso', 'Excesivo'],
  'Compañero dormido': ['Sueño', 'Ronquidos', 'Babear', 'Clase', 'Cansado'],

  // Cosas que huelen
  'Perfume fuerte': ['Olor', 'Intenso', 'Nariz', 'Exagerado', 'Mareo'],
  'Zapato mojado': ['Pie', 'Húmedo', 'Mal olor', 'Sudor', 'Calcetín'],
  'Comida recalentada': ['Microondas', 'Olor', 'Pescado', 'Oficina', 'Molesto'],
  'Cebolla': ['Llorar', 'Fuerte', 'Picante', 'Ojos', 'Cocinar'],
  'Sudor': ['Ejercicio', 'Olor', 'Axilas', 'Húmedo', 'Desodorante'],
  'Ambientador exagerado': ['Perfume', 'Artificial', 'Fuerte', 'Carro', 'Baño'],
  'Gasolina': ['Combustible', 'Fuerte', 'Tóxico', 'Estación', 'Químico'],
  'Té de hierbas': ['Infusión', 'Aroma', 'Natural', 'Taza', 'Medicinal'],
  'Ropa guardada': ['Closet', 'Viejo', 'Humedad', 'Moho', 'Naftalina'],

  // Cosas pegajosas
  'Miel': ['Dulce', 'Viscosa', 'Abejas', 'Dorado', 'Pegar'],
  'Slime': ['Viscoso', 'Elástico', 'Juguete', 'Manos', 'Pegajoso'],
  'Chicle': ['Masticar', 'Pegar', 'Zapato', 'Dulce', 'Burbujas'],
  'Mermelada': ['Dulce', 'Frutas', 'Pan', 'Pegajosa', 'Frasco'],
  'Salsa': ['Pegajosa', 'Tomate', 'Comida', 'Manchar', 'Roja'],
  'Pegamento': ['Pegar', 'Adhesivo', 'Blanco', 'Manualidades', 'Secar'],
  'Caramelo derretido': ['Dulce', 'Calor', 'Viscoso', 'Manos', 'Pegajoso'],
  'Gel para el pelo': ['Cabello', 'Peinado', 'Fijador', 'Brillante', 'Pegajoso'],

  // Cosas que asustan
  'Sombra extraña': ['Oscuridad', 'Figura', 'Miedo', 'Noche', 'Pared'],
  'Grito': ['Fuerte', 'Susto', 'Voz', 'Terror', 'Sorpresa'],
  'Insecto grande': ['Bicho', 'Patas', 'Volar', 'Asco', 'Gritar'],
  'Perro ladrando': ['Fuerte', 'Dientes', 'Noche', 'Agresivo', 'Miedo'],
  'Trueno fuerte': ['Ruido', 'Cielo', 'Tormenta', 'Sorpresa', 'Brinco'],
  'Puerta que se mueve': ['Crujido', 'Viento', 'Sola', 'Misterio', 'Miedo'],
  'Gato saltando': ['Sorpresa', 'Susto', 'Rápido', 'Inesperado', 'Corazón'],
  'Silencio total': ['Quietud', 'Tenso', 'Extraño', 'Incómodo', 'Inquietante'],
  'Teléfono sonando de noche': ['Timbre', 'Oscuro', 'Quién', 'Susto', 'Madrugada'],

  // Cosas que no existen
  'Unicornio ladrón': ['Imaginario', 'Absurdo', 'Mágico', 'Criminal', 'Imposible'],
  'Perro con alas': ['Volar', 'Imaginario', 'Mitológico', 'Fantástico', 'Cielo'],
  'Gato gigante': ['Enorme', 'Felino', 'Imposible', 'Kaiju', 'Fantástico'],
  'Silla invisible': ['Sentarse', 'Aire', 'Mágica', 'No ver', 'Caer'],
  'Pan que habla': ['Comunicar', 'Voz', 'Mágico', 'Imposible', 'Gracioso'],
  'Zapato volador': ['Aire', 'Flotar', 'Mágico', 'Imposible', 'Fantástico'],
  'Dragón de oficina': ['Escritorio', 'Fuego', 'Cubículo', 'Absurdo', 'Fantástico'],
  'Pez en bicicleta': ['Absurdo', 'Agua', 'Pedales', 'Imposible', 'Gracioso'],
  'Café infinito': ['Nunca acaba', 'Mágico', 'Taza', 'Ilimitado', 'Sueño'],
  'Sombrero inteligente': ['Pensar', 'Cabeza', 'Mágico', 'IA', 'Hogwarts'],
  'Planta que canta': ['Música', 'Hojas', 'Voz', 'Mágica', 'Imposible'],

  // Objetos sospechosos
  'Caja que vibra': ['Mover', 'Misteriosa', 'Adentro', 'Miedo', 'Celular'],
  'Bolsa misteriosa': ['Desconocida', 'Cerrada', 'Curiosidad', 'Qué es', 'Sospecha'],
  'Sobre sin remitente': ['Carta', 'Misterio', 'Quién', 'Anónimo', 'Secreto'],
  'Llave que no abre nada': ['Inútil', 'Cerradura', 'Misteriosa', 'Antigua', 'Perdida'],
  'Control remoto sin televisor': ['Botones', 'Inútil', 'Huérfano', 'Baterías', 'Guardado'],
  'Botón rojo': ['No presionar', 'Peligro', 'Tentación', 'Consecuencias', 'Emergencia'],
  'Maleta demasiado pesada': ['Cargar', 'Qué hay', 'Sospechosa', 'Esfuerzo', 'Curiosidad'],
  'Sombrero extraño': ['Raro', 'Forma', 'Moda', 'Llamativo', 'Dudoso'],

  // Cosas que harías en secreto
  'Bailar solo': ['Música', 'Nadie ve', 'Casa', 'Libertad', 'Ridículo'],
  'Hablar con un espejo': ['Reflejon', 'Conversar', 'Practicar', 'Loco', 'Solo'],
  'Practicar poses': ['Espejo', 'Fotos', 'Modelar', 'Vanidad', 'Selfie'],
  'Cantar reggaetón a escondidas': ['Perreo', 'Vergüenza', 'Culpable', 'Dembow', 'Secreto'],
  'Stalkear ex': ['Redes', 'Mirar', 'Perfil', 'Curiosidad', 'Pasado'],
  'Comer a medianoche': ['Refrigerador', 'Noche', 'Hambre', 'Escondidas', 'Culpa'],
  'Reír por memes viejos': ['Nostalgia', 'Gracioso', 'Solos', 'Repetir', 'Risas'],
  'Ver historias sin sonido': ['Silencio', 'Instagram', 'Disimular', 'Público', 'Subtítulos'],

  // Animales tontos
  'Gallina confundida': ['Correr', 'Perdida', 'Pico', 'Cacarea', 'Loca'],
  'Perro que se cae': ['Torpe', 'Resbalar', 'Gracioso', 'Tropezar', 'Patitas'],
  'Gato sorprendido': ['Salto', 'Ojos', 'Susto', 'Pepino', 'Reacción'],
  'Pato desesperado': ['Graznido', 'Correr', 'Alas', 'Pánico', 'Cuac'],
  'Conejo lento': ['Tortuga', 'Perezoso', 'Orejas', 'Contrario', 'Raro'],
  'Oveja dramática': ['Balido', 'Exagerada', 'Lana', 'Berrinche', 'Desmayo'],
  'Cabra gritona': ['Beee', 'Fuerte', 'Meme', 'Escalada', 'Ruidosa'],
  'Cerdo risueño': ['Gruñido', 'Feliz', 'Lodo', 'Sonrisa', 'Gracioso'],

  // Cosas que da pena
  'Tropezar en público': ['Caer', 'Gente', 'Vergüenza', 'Miradas', 'Levantarse'],
  'Saludar a quien no es': ['Error', 'Confusión', 'Pena', 'Disculpas', 'Equivocado'],
  'Decir "igualmente" cuando no toca': ['Automático', 'Error', 'Buen provecho', 'Vergüenza', 'Respuesta'],
  'Confundir el nombre de alguien': ['Llamar', 'Otro', 'Pena', 'Disculpa', 'Incomodar'],
  'Gritar sin querer': ['Fuerte', 'Público', 'Silencio', 'Vergüenza', 'Miradas'],
  'Que te llamen por megáfono': ['Público', 'Nombre', 'Atención', 'Vergüenza', 'Gente'],

  // Cosas que no deberían moverse
  'Silla': ['Sentarse', 'Estática', 'Patas', 'Mueble', 'Inmóvil'],
  'Escoba': ['Barrer', 'Quieta', 'Palo', 'Rincón', 'Harry Potter'],
  'Árbol pequeño': ['Planta', 'Maceta', 'Fijo', 'Raíces', 'Verde'],
  'Maceta': ['Planta', 'Cerámica', 'Decoración', 'Tierra', 'Estática'],
  'Televisor': ['Pantalla', 'Pared', 'Fijo', 'Grande', 'Pesado'],
  'Zapatos': ['Par', 'Piso', 'Quietos', 'Guardar', 'Ordenados'],
  'Cortina': ['Ventana', 'Tela', 'Colgar', 'Fija', 'Decoración'],
  'Mesa': ['Mueble', 'Pesada', 'Fija', 'Patas', 'Superficie'],
  'Almohada': ['Cama', 'Suave', 'Quieta', 'Dormir', 'Plumas'],

  // Cosas muy específicas
  'La tapa de la tapa': ['Redundante', 'Específico', 'Doble', 'Protección', 'Extra'],
  'El cable del cargador del vecino': ['Prestado', 'Específico', 'Ajeno', 'Olvidado', 'Devolver'],
  'La esquina del sofá': ['Rincón', 'Golpear', 'Dedos', 'Mueble', 'Dolor'],
  'La esquina de la caja de cereal': ['Cartón', 'Doblez', 'Específica', 'Abrir', 'Envase'],
  'El tornillo suelto': ['Rosca', 'Faltante', 'Específico', 'Ajustar', 'Pequeño'],
  'La etiqueta que pica': ['Ropa', 'Molesta', 'Rasca', 'Cortar', 'Cuello'],

  // Excusas malas
  'Había tráfico de tortugas': ['Lento', 'Absurdo', 'Excusa', 'Tarde', 'Ridículo'],
  'Mi perro apagó el despertador': ['Mascota', 'Culpa', 'Absurdo', 'Tarde', 'Invento'],
  'Se cayó el internet emocional': ['Absurdo', 'Excusa', 'Sentimientos', 'Inventado', 'Ridículo'],
  'Perdí el sentido del tiempo': ['Confusión', 'Tarde', 'Excusa', 'Despistado', 'Común'],
  'Me dormí pensando': ['Filosofía', 'Profundo', 'Excusa', 'Tarde', 'Absurdo'],
  'Mi fantasma me distrajo': ['Paranormal', 'Absurdo', 'Excusa', 'Imaginario', 'Ridículo'],

  // Acciones que parecen sospechosas
  'Mirar a todos lados': ['Nervioso', 'Paranoia', 'Vigilancia', 'Sospecha', 'Culpable'],
  'Esconder algo': ['Ocultar', 'Guardae', 'Secreto', 'Bolsillo', 'Rápido'],
  'Hablar bajito': ['Susurrar', 'Secreto', 'Teléfono', 'Conspiración', 'Murmurar'],
  'Tocar muchas veces un bolsillo': ['Nervioso', 'Verificar', 'Llaves', 'Repetitivo', 'Ansioso'],
  'Reirse solo': ['Loco', 'Meme', 'Raro', 'Solitario', 'Sospechoso'],
  'Caminar rápido sin razón': ['Apurado', 'Sospecha', 'Velocidad', 'Escapar', 'Nervioso'],
  'Voltear de golpe': ['Paranoia', 'Sorpresa', 'Rápido', 'Mirar atrás', 'Seguimiento'],

  // Inventos raros
  'Cepillo para cejas de perro': ['Absurdo', 'Mascota', 'Específico', 'Inútil', 'Raro'],
  'Silla con wifi': ['Tecnología', 'Mueble', 'Innecesario', 'Moderno', 'Absurdo'],
  'Calcetines con GPS': ['Localización', 'Pies', 'Tecnología', 'Perdidos', 'Innecesario'],
  'Sombrero con linterna': ['Cabeza', 'Luz', 'Manos libres', 'Minero', 'Práctico'],
  'Cuchara traductora': ['Idiomas', 'Comer', 'Tecnología', 'Absurdo', 'Futurista'],
  'Lámpara que flota': ['Levitar', 'Magnética', 'Tecnología', 'Futurista', 'Mágica'],
  'Radio solar para gatos': ['Mascota', 'Música', 'Solar', 'Innecesario', 'Específico'],

  // Cosas pegajosas extremas
  'Slime explosivo': ['Viscoso', 'Peligroso', 'Pegajoso', 'Reventar', 'Extremo'],
  'Miel chorreando': ['Dulce', 'Gotear', 'Pegajoso', 'Desastre', 'Viscoso'],
  'Pegamento eterno': ['Permanente', 'Fuerte', 'Adhesivo', 'Para siempre', 'Industrial'],
  'Chicle derretido': ['Calor', 'Pegajoso', 'Zapato', 'Desastre', 'Acera'],
  'Salsa derramada': ['Mancha', 'Pegajosa', 'Roja', 'Desastre', 'Ropa'],
  'Caramelo fundido': ['Calor', 'Líquido', 'Azúcar', 'Pegajoso', 'Quemadura'],

  // Cosas demasiado silenciosas
  'Calcetín': ['Pie', 'Tela', 'Suave', 'Silencioso', 'Par'],
  'Sombrero': ['Cabeza', 'Quieto', 'Mudo', 'Accesorio', 'Silencioso'],
  'Botella vacía': ['Sin líquido', 'Plástico', 'Hueca', 'Muda', 'Reciclar'],
  'Lapicero sin tinta': ['Inútil', 'Vacío', 'Escribir', 'Seco', 'Mudo'],
  'Caja de cartón': ['Vacía', 'Marrón', 'Empacar', 'Muda', 'Liviana'],
  'Banano dormido': ['Fruta', 'Quieto', 'Amarillo', 'Silencioso', 'Absurdo'],

  // Cosas que suenan raro
  'Pato enfadado': ['Graznido', 'Cuac', 'Molesto', 'Ave', 'Ruidoso'],
  'Puerta vieja': ['Crujir', 'Chirrido', 'Oxidada', 'Ruido', 'Bisagras'],
  'Gato con hambre': ['Maullido', 'Insistente', 'Fuerte', 'Comida', 'Molesto'],
  'Silla vieja': ['Crujido', 'Madera', 'Chirrido', 'Inestable', 'Ruido'],
  'Zapato mojado': ['Chapotear', 'Húmedo', 'Squish', 'Incómodo', 'Ruido'],
  'Auto sin aceite': ['Motor', 'Ruido', 'Golpeteo', 'Dañado', 'Mecánico'],

  // Objetos mágicamente inútiles
  'Cuchara transparente': ['Ver', 'Invisible', 'Inútil', 'Absurda', 'Líquido'],
  'Libro sin páginas': ['Vacío', 'Portada', 'Inútil', 'Decoración', 'Absurdo'],
  'Linterna solar de noche': ['Oscuridad', 'Inútil', 'Solar', 'Contradicción', 'Absurda'],
  'Sombrero sin fondo': ['Agujero', 'Inútil', 'Roto', 'Absurdo', 'Mágico'],
  'Reloj sin números': ['Hora', 'Manecillas', 'Confuso', 'Inútil', 'Decorativo'],
  'Lápiz sin punta': ['Romo', 'Inútil', 'Escribir', 'Necesita', 'Sacar punta'],
  'Escalera plana': ['Horizontal', 'Subir', 'Inútil', 'Absurda', 'Contradicción'],

  // Lugares raros
  'La esquina del supermercado': ['Olvidada', 'Rincón', 'Productos', 'Específica', 'Perdida'],
  'Un pasillo infinito': ['Largo', 'Sin fin', 'Caminar', 'Eterno', 'Laberinto'],
  'La cola equivocada': ['Fila', 'Error', 'Esperar', 'Confusión', 'Lenta'],
  'La silla que nadie usa': ['Vacía', 'Evitada', 'Maldita', 'Incómoda', 'Solitaria'],
  'El sótano prohibido': ['Oscuro', 'Prohibido', 'Misterio', 'Abajo', 'Miedo'],
  'El cuarto del ruido': ['Sonidos', 'Extraño', 'Misterioso', 'Molesto', 'Inexplicable'],

  // Cosas que nadie admite
  'Comerse las uñas': ['Nervios', 'Mordere', 'Mal hábito', 'Dedos', 'Ocultar'],
  'Oler ropa limpia': ['Aroma', 'Nariz', 'Fresco', 'Placer', 'Secreto'],
  'Buscar memes viejos': ['Nostalgia', 'Risas', 'Repetir', 'Internet', 'Scroll'],
  'Hablar solo': ['Monólogo', 'Conversar', 'Loco', 'Pensar', 'Voz'],
  'Dormir en reuniones': ['Aburrido', 'Sueño', 'Cabecear', 'Trabajo', 'Disimular'],
  'Repetir outfits': ['Ropa', 'Misma', 'Ahorrar', 'Favorito', 'Reciclar'],

  // Comida imposible
  'Pizza líquida': ['Derretida', 'Absurda', 'Beber', 'Imposible', 'Salsa'],
  'Café sólido': ['Duro', 'Congelado', 'Absurdo', 'Imposible', 'Bloque'],
  'Ensalada caliente': ['Lechuga', 'Cocida', 'Rara', 'Marchita', 'Extraña'],
  'Helado de pollo': ['Carne', 'Frío', 'Absurdo', 'Imposible', 'Asqueroso'],
  'Pan sin harina': ['Imposible', 'Aire', 'Absurdo', 'Ingrediente', 'Necesario'],
  'Chocolate salado': ['Dulce', 'Sal', 'Raro', 'Mezcla', 'Extraño'],
  'Tamal transparente': ['Invisible', 'Ver', 'Absurdo', 'Imposible', 'Masa'],

  // Cosas chiquitas but poderosas
  'Chinche': ['Pequeño', 'Pinchazo', 'Dolor', 'Clavo', 'Pin'],
  'Mosquito': ['Picar', 'Pequeño', 'Molesto', 'Zumbido', 'Sangre'],
  'Confeti': ['Papelitos', 'Fiesta', 'Pequeños', 'Difícil limpiar', 'Colores'],
  'Semilla': ['Pequeña', 'Plantar', 'Potencial', 'Crecer', 'Vida'],
  'Arena': ['Granitos', 'Playa', 'Pequeños', 'Molestos', 'Infinitos'],
  'Granito de arroz': ['Pequeño', 'Grano', 'Blanco', 'Cocinar', 'Leve'],
  'Tornillito': ['Pequeño', 'Rosca', 'Metal', 'Importante', 'Ajustar'],
  'Astilla': ['Madera', 'Pequeña', 'Dolor', 'Pinchar', 'Sacar']
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
    let room = rooms.get(roomId)

    // Si es modo local (OFFLINE) y la sala existe, resetearla
    if (roomId.startsWith('OFFLINE') && room) {
      console.log('Reseteando sala OFFLINE para nueva partida')
      room = {
        roomId,
        players: [],
        phase: 'lobby',
        config: room.config || {
          maxPlayers: 8,
          rounds: 3,
          category: 'general',
          timePerClue: 60,
        },
        impostorHistory: []
      }
      rooms.set(roomId, room)
    } else if (!room) {
      // Crear nueva sala si no existe
      room = {
        roomId,
        players: [],
        phase: 'lobby',
        config: {
          maxPlayers: 8,
          rounds: 3,
          category: 'general',
          timePerClue: 60,
        },
        impostorHistory: []
      }
      rooms.set(roomId, room)
    }

    socket.emit('room-state', room)
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
  socket.on('start-game', ({ roomId, config }) => {
    const room = rooms.get(roomId)
    if (!room || room.players.length < 3) return

    // Actualizar configuración si se envió
    if (config) {
      room.config = { ...room.config, ...config }
    }

    // Inicializar historial si no existe
    if (!room.impostorHistory) {
      room.impostorHistory = []
    }

    // Verificar jugadores que han sido impostores en las últimas 2 partidas
    const recentImpostors = room.impostorHistory.slice(-2)
    let eligiblePlayers = room.players.filter(player => {
      // Contar cuántas veces consecutivas este jugador ha sido impostor
      const consecutiveCount = recentImpostors.filter(id => id === player.id).length
      return consecutiveCount < 2
    })

    // Si todos los jugadores han sido impostores 2 veces seguidas, resetear el historial
    if (eligiblePlayers.length === 0) {
      room.impostorHistory = []
      eligiblePlayers = [...room.players]
    }

    // Seleccionar impostor entre los elegibles
    const randomIndex = Math.floor(Math.random() * eligiblePlayers.length)
    const selectedImpostor = eligiblePlayers[randomIndex]

    // Agregar el impostor seleccionado al historial
    room.impostorHistory.push(selectedImpostor.id)

    // Mantener solo las últimas 10 entradas en el historial para evitar que crezca indefinidamente
    if (room.impostorHistory.length > 10) {
      room.impostorHistory = room.impostorHistory.slice(-10)
    }

    // Asignar roles a los jugadores
    room.players = room.players.map((player) => ({
      ...player,
      isImpostor: player.id === selectedImpostor.id,
      isEliminated: false,
      votes: 0,
    }))

    // Seleccionar palabra
    const categoryWords = WORDS[room.config.category] || WORDS.general
    room.secretWord = categoryWords[Math.floor(Math.random() * categoryWords.length)]

    // Seleccionar pista falsa para el impostor
    const wordHints = HINTS[room.secretWord]
    if (wordHints && wordHints.length > 0) {
      room.impostorHint = wordHints[Math.floor(Math.random() * wordHints.length)]
    } else {
      // Si no hay pistas para esta palabra, usar una pista genérica relacionada con la categoría
      room.impostorHint = 'Relacionado con ' + room.config.category
    }

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

  // Revancha - resetear la sala manteniendo los jugadores
  socket.on('rematch', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (!room) return

    // Resetear jugadores (quitar roles y votos)
    room.players = room.players.map(p => ({
      ...p,
      isImpostor: false,
      isEliminated: false,
      votes: 0,
    }))

    // Resetear estado del juego
    room.phase = 'lobby'
    room.secretWord = null
    room.impostorHint = null
    room.currentRound = 1
    room.currentTurn = 0
    room.clues = []
    room.votes = {}
    room.eliminatedPlayer = null
    room.winner = null

    // Notificar a todos los clientes
    io.to(roomId).emit('room-state', room)
    console.log(`Sala ${roomId} reseteada para revancha`)
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
