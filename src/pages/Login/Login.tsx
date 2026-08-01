//import Navigation from '@/components/blocks/Navigation/Navigation'
//import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import styles from './Login.module.css'
import Button from '@/components/ui/Button/Button.tsx'
import PasswordInput from '@/components/ui/PasswordInput/PasswordInput'
import { login } from '@/api/login.ts'

import logo from './assets/logoFRS.png'
import 'devicon/devicon.min.css';


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
        <div className={styles.adsContent}>
          <img className={styles.promoLogo} src= {logo} alt="Logo" />
          <div className={styles.adsText}>
            <h5>INGENIERIA DE SOFTWARE</h5>
          </div>
        </div>
        <div className={styles.stackFooter}>
          <img className={`${styles.stackIcon} ${styles.mongodb}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/mongodb/default.svg" title="MongoDB" alt="MongoDB" />
          <img className={`${styles.stackIcon} ${styles.react}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/react/default.svg" title="React" alt="React" />
          <img className={`${styles.stackIcon} ${styles.typescript}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/typescript/default.svg" title="TypeScript" alt="TypeScript" />
          <img className={`${styles.stackIcon} ${styles.node}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/nodejs/wordmark.svg" title="Node.js" alt="Node.js" />
          <img className={`${styles.stackIcon} ${styles.express}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/expressdotjs/light.svg" title="Express.js" alt="Express.js" />
          <img className={`${styles.stackIcon} ${styles.vite}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/vite/default.svg" title="Vite" alt="Vite" />
          <img className={`${styles.stackIcon} ${styles.cssmodules}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/css-new/default.svg" title="CSS Modules" alt="CSS Modules" />
          <img className={`${styles.stackIcon} ${styles.tanstack}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/tanstack/default.svg" title="TanStack" alt="TanStack" />
          <img className={`${styles.stackIcon} ${styles.javascript}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/javascript/default.svg" title="JavaScript" alt="JavaScript" />
        </div>
      </section>

    </main>
  )
}

export default Login