import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import UserProfile from '@/components/user/UserProfile'
import Leaderboard from '@/components/user/Leaderboard'
import { useAuth } from '@/contexts/AuthContext'

export default function Stats() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-white">Estadísticas</h1>
        </div>

        {/* Perfil del usuario (solo si está autenticado) */}
        {isAuthenticated && <UserProfile />}

        {/* Leaderboard */}
        <Leaderboard />

        {/* Mensaje para usuarios no autenticados */}
        {!isAuthenticated && (
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 text-center">
            <p className="text-white/70 mb-4">
              Inicia sesión para ver tus estadísticas personales y aparecer en el leaderboard
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="secondary"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
              <Button onClick={() => navigate('/register')}>
                Registrarse
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}
