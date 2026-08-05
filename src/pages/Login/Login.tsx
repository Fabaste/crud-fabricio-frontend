import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import styles from './Login.module.css'
import Button from '@/components/ui/Button/Button.tsx'
import { login, verificar2FA } from '@/api/login.ts' // <-- Añadimos verificar2FA

import { toast } from 'react-hot-toast';

import logo from './assets/logoFRS.png'
import 'devicon/devicon.min.css';
import PasswordInput from '@/components/ui/Input/PasswordInput'

function Login() {
  const navigate = useNavigate()

  // Inputs del Paso 1
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Inputs del Paso 2 (2FA)
  const [step2FA, setStep2FA] = useState(false)
  const [codigo2FA, setCodigo2FA] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [tokenTemporal, setTokenTemporal] = useState<string>('')

  // Estados comunes
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Paso 1: Enviar Email y Contraseña
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // 2. Iniciamos el toast de carga y guardamos su ID de referencia
    const toastId = toast.loading('Procesando credenciales...')

    try {
      const data = await login(email, password) as any
      
      // Si el backend nos dice que requiere verificación 2FA
      if (data.requiere2FA) {
        setTokenTemporal(data.tokenTemporal)
        setStep2FA(true)
        if (data.qrCode) {
          // Si es configuración inicial, el back nos mandará el string Base64 del QR
          setQrCodeUrl(data.qrCode)
          toast.success('Contraseña correcta. Escaneá el código QR.', { id: toastId })
        } else {
          toast.success('Contraseña correcta. Ingresá tu código de 6 digitos.', { id: toastId })
        }
      } else {
        // Flujo tradicional si no tuviese el 2FA forzado (o directo)
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)
        localStorage.setItem('userId', data.userId)

        toast.success('¡Inicio de sesión exitoso!', { id: toastId })
        navigate({ to: '/' })
      }
    } catch (error: any) {
      setError(error.message)
      // 3. Reutilizamos el ID para transformar la carga en un aviso de error explícito
      toast.error(error.message || 'Error al iniciar sesión', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  // Paso 2: Enviar código de 6 dígitos
  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const toastId = toast.loading('Verificando código de seguridad...')

    try {
      const data = await verificar2FA(tokenTemporal, codigo2FA)
      
      // Guardamos el token definitivo de sesión
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role) 
      localStorage.setItem('userId', data.userId)
      toast.success('¡Doble factor verificado! Bienvenido.', { id: toastId })
      
      navigate({ to: '/' })
    } catch (error: any) {
      setError(error.message)
      toast.error(error.message || 'Código incorrecto o expirado', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.container}>
      <section className={styles.left}>
        
        {/* INTERFAZ DEL PASO 1: LOGIN TRADICIONAL */}
        {!step2FA ? (
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
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />

            {/*{error && <p className={styles.error}>{error}</p>}*/}

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>

            <p className={styles.footer}>
              ¿No tenés cuenta? <button type="button" className={styles.linkButton} onClick={() => navigate({ to: '/register' })}>Registrarse</button>
            </p>
          </form>
        ) : (
          
          /* INTERFAZ DEL PASO 2: DOBLE FACTOR DE SEGURIDAD */
          <form className={styles.form} onSubmit={handleVerify2FA}>
            <h1 className={styles.title}>Seguridad de dos pasos</h1>
            <p className={styles.subtitle}>
              {qrCodeUrl 
                ? 'Escaneá este código QR con tu app de autenticación (Google Authenticator) e ingresá el código de 6 dígitos.' 
                : 'Ingresá el código de 6 dígitos generado por tu aplicación.'}
            </p>

            {/* Muestra el QR de forma dinámica si el backend lo envía */}
            {qrCodeUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <img src={qrCodeUrl} alt="Código QR de verificación" style={{ border: '4px solid white', borderRadius: '8px' }} />
              </div>
            )}

            <label className={styles.label} htmlFor="codigo2FA">Código de Autenticación</label>
            <input
              className={styles.input}
              id="codigo2FA"
              type="text"
              placeholder="000000"
              maxLength={6}
              pattern="\d*"
              value={codigo2FA}
              onChange={(e) => setCodigo2FA(e.target.value.replace(/\D/g, ''))} // Solo números
              required
              autoFocus
            />

            {/*{error && <p className={styles.error}>{error}</p>}*/}

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar Código'}
            </Button>

            <p className={styles.footer}>
              <button type="button" className={styles.linkButton} onClick={() => { setStep2FA(false); setError(null); }}>
                Volver al login
              </button>
            </p>
          </form>
        )}
      </section>

      <section className={styles.right}>
        <div className={styles.adsContent}>
          <img className={styles.promoLogo} src={logo} alt="Logo" />
          <div className={styles.adsText}>
            <h5>INGENIERIA DE SOFTWARE</h5>
          </div>
        </div>
        {/* Tu stackFooter se queda idéntico */}
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















/*//import Navigation from '@/components/blocks/Navigation/Navigation'
//import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import styles from './Login.module.css'
import Button from '@/components/ui/Button/Button.tsx'
import { login } from '@/api/login.ts'

import logo from './assets/logoFRS.png'
import 'devicon/devicon.min.css';
import PasswordInput from '@/components/ui/Input/PasswordInput'


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
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required />

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

export default Login*/