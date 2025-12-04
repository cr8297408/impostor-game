/**
 * @typedef {Object} Player
 * @property {string} id - ID único del jugador
 * @property {string} name - Nombre del jugador
 * @property {string} avatar - Color/avatar del jugador
 * @property {boolean} isImpostor - Si es el impostor
 * @property {boolean} isEliminated - Si fue eliminado
 * @property {number} votes - Votos recibidos
 */

/**
 * @typedef {Object} Clue
 * @property {string} playerId - ID del jugador que dio la pista
 * @property {string} playerName - Nombre del jugador
 * @property {string} text - Texto de la pista
 * @property {number} round - Ronda en la que se dio
 */

/**
 * @typedef {Object} GameConfig
 * @property {number} maxPlayers - Máximo de jugadores
 * @property {number} rounds - Número de rondas
 * @property {string} category - Categoría de palabras
 * @property {number} timePerClue - Tiempo por pista (segundos)
 */

/**
 * @typedef {Object} GameState
 * @property {string} roomId - ID de la sala
 * @property {Player[]} players - Lista de jugadores
 * @property {string} secretWord - Palabra secreta
 * @property {Clue[]} clues - Pistas dadas
 * @property {number} currentRound - Ronda actual
 * @property {number} currentTurn - Turno actual
 * @property {string} phase - Fase del juego: 'lobby' | 'secret' | 'clues' | 'voting' | 'results'
 * @property {GameConfig} config - Configuración del juego
 * @property {boolean} isOnline - Si es partida online
 * @property {Object} votes - Mapa de votos {voterId: votedPlayerId}
 */

export {}
