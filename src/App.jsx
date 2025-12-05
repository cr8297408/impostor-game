import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './screens/Home'
import Lobby from './screens/Lobby'
import SecretWord from './screens/SecretWord'
import Game from './screens/Game'
import Voting from './screens/Voting'
import Results from './screens/Results'
import AdLayout from './components/ads/AdLayout'

function App() {
  return (
    <Router>
      {/* <AdLayout> */}
        <div className="min-h-screen bg-gradient-to-br from-impostor-darker via-impostor-dark to-impostor-darker">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lobby/:roomId?" element={<Lobby />} />
              <Route path="/secret/:roomId?" element={<SecretWord />} />
              <Route path="/game/:roomId?" element={<Game />} />
              <Route path="/voting/:roomId?" element={<Voting />} />
              <Route path="/results/:roomId?" element={<Results />} />
            </Routes>
          </AnimatePresence>
        </div>
      {/* </AdLayout> */}
    </Router>
  )
}

export default App
