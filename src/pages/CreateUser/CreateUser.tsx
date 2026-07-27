import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import styles from './CreateUser.module.css'
import Button from '@/components/ui/Button/Button'
import { createUser } from '@/api/createUser'

function CreateUser() {
  const navigate = useNavigate()

  // Inputs controlados: React es la fuente de verdad del valor
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Esta página es solo para admins logueados: sin token, no entra
    if (!localStorage.getItem('token')) {
      navigate({ to: '/login' })
    }
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // Evita que el navegador recargue la página
    setError(null)
    setLoading(true)
    try {
      await createUser(nombre, apellido, email, password)
      // Usuario creado → volvemos a la lista para verlo
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
          <h1 className={styles.title}>Crear Usuario</h1>
          <p className={styles.subtitle}>Completá los datos del nuevo usuario</p>

          <label className={styles.label} htmlFor="name">Nombre</label>
          <input
            className={styles.input}
            id="name"
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label className={styles.label} htmlFor="lastname">Apellido</label>
          <input
            className={styles.input}
            id="lastname"
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />

          <label className={styles.label} htmlFor="email">Email</label>
          <input
            className={styles.input}
            id="email"
            type="email"
            placeholder="usuario@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className={styles.label} htmlFor="password">Contraseña</label>
          <input
            className={styles.input}
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {/* Mensaje de error que viene del backend */}
          {error && <p className={styles.error}>{error}</p>}

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Usuario'}
          </Button>

          <p className={styles.footer}>
            <Link to="/">Volver a la lista</Link>
          </p>
        </form>
      </section>

      <section className={styles.right}></section>

    </main>
  )
}

export default CreateUser