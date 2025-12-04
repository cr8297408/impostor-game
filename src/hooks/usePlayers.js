import { useGameStore } from '@/store/gameStore'

export const usePlayers = () => {
  const players = useGameStore(state => state.players)
  const currentPlayerId = useGameStore(state => state.currentPlayerId)

  const getPlayerById = (id) => {
    return players.find(p => p.id === id)
  }

  const getCurrentPlayer = () => {
    return getPlayerById(currentPlayerId)
  }

  const getActivePlayers = () => {
    return players.filter(p => !p.isEliminated)
  }

  const getEliminatedPlayers = () => {
    return players.filter(p => p.isEliminated)
  }

  const getImpostor = () => {
    return players.find(p => p.isImpostor)
  }

  const getCivilians = () => {
    return players.filter(p => !p.isImpostor)
  }

  const isImpostor = (playerId) => {
    const player = getPlayerById(playerId)
    return player?.isImpostor || false
  }

  const isEliminated = (playerId) => {
    const player = getPlayerById(playerId)
    return player?.isEliminated || false
  }

  const isCurrentPlayer = (playerId) => {
    return playerId === currentPlayerId
  }

  return {
    players,
    currentPlayerId,
    getPlayerById,
    getCurrentPlayer,
    getActivePlayers,
    getEliminatedPlayers,
    getImpostor,
    getCivilians,
    isImpostor,
    isEliminated,
    isCurrentPlayer,
  }
}
