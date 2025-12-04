import { useGameStore } from '@/store/gameStore'
import { WORDS } from '@/lib/words'

export const useGame = () => {
  const store = useGameStore()

  const startGame = () => {
    store.startGame(WORDS)
  }

  const addClue = (text) => {
    if (!text.trim()) return
    store.addClue(store.currentPlayerId, text.trim())
  }

  const submitVote = (playerId) => {
    store.vote(store.currentPlayerId, playerId)
  }

  const finishVoting = () => {
    store.calculateVotes()
  }

  const getCurrentTurnPlayer = () => {
    return store.getCurrentPlayer()
  }

  const isMyTurn = () => {
    const currentPlayer = getCurrentTurnPlayer()
    return currentPlayer?.id === store.currentPlayerId
  }

  const isImpostor = () => {
    return store.isPlayerImpostor(store.currentPlayerId)
  }

  const getActivePlayers = () => {
    return store.players.filter(p => !p.isEliminated)
  }

  const hasVoted = () => {
    return store.currentPlayerId in store.votes
  }

  const allPlayersVoted = () => {
    const activePlayers = getActivePlayers()
    return Object.keys(store.votes).length === activePlayers.length
  }

  return {
    // State
    ...store,

    // Actions
    startGame,
    addClue,
    submitVote,
    finishVoting,

    // Computed
    getCurrentTurnPlayer,
    isMyTurn,
    isImpostor,
    getActivePlayers,
    hasVoted,
    allPlayersVoted,
  }
}
