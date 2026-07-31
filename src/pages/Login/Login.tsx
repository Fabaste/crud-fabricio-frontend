//import Navigation from '@/components/blocks/Navigation/Navigation'
//import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import styles from './Login.module.css'
import Button from '@/components/ui/Button/Button.tsx'
import PasswordInput from '@/components/ui/PasswordInput/PasswordInput'
import { login } from '@/api/login.ts'

import logo from '@/assets/logoFRS.png'

function Login() {
  const navigate = useNavigate()

  // Inputs controlados: React es la fuente de verdad del valor
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // Evita que el navegador recargue la página
    setError(null)
    setLoading(true)
    try {
      const data = await login(email, password)
      //console.log(data)
      // Guardamos el token para las futuras peticiones autenticadas
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      navigate({ to: '/' })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.container}>

      <section className={styles.left}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Iniciar Sesión</h1>
          <p className={styles.subtitle}>Ingresá tu email y contraseña para continuar</p>

          <label className={styles.label} htmlFor="email">Email</label>
          <input
            className={styles.input}
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className={styles.label} htmlFor="password">Contraseña</label>
          <PasswordInput
            className={styles.input}
            id="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Mensaje de error que viene del backend */}
          {error && <p className={styles.error}>{error}</p>}

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>

          <p className={styles.footer}>
            ¿No tenés cuenta? <button type="button" className={styles.linkButton} onClick={() => navigate({ to: '/register' })}>Registrarse</button>
          </p>
        </form>
      </section>

            <section className={styles.right}>
                <div>
                  <img src= {logo} alt="Imagen publicitaria" />
                </div>
            </section>

        </main>
    )
}

export default Login