import { api } from './lib/apiClient.js'
import { createContext, useContext, useEffect, useState } from 'react'

type User = {
  id: number
  username: string
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// 1. Créer le contexte
const AuthContext = createContext<AuthContextType | null>(null)

// 2. Hook pour l'utiliser facilement depuis n'importe quel composant
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// 3. Le Provider — enveloppe toute l'app et fournit les données
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)


  async function login(email: string, password: string) {
    const response = await api.post('/auth/login', {email, password})
    const { user } = response.data.data //reponse du backend est dans data.user
    setUser(user)
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {}
    setUser(null)
  }
  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await api.get('/auth/me')
        const user = response.data.data.user
        setUser(user)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}