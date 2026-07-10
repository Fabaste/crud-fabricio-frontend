import { Link } from '@tanstack/react-router'
import styles from './Register.module.css'
import Button from '@/components/ui/Button/Button'

function Register() {
  return (
    <main className={styles.container}>

      <section className={styles.left}>
        <div className={styles.form}>
          <h1 className={styles.title}>Crear Cuenta</h1>
          <p className={styles.subtitle}>Completá tus datos para registrarte</p>

          <label className={styles.label} htmlFor="name">Nombre</label>
          <input className={styles.input} id="name" type="text" placeholder="Tu nombre" />

          <label className={styles.label} htmlFor="email">Email</label>
          <input className={styles.input} id="email" type="email" placeholder="tu@email.com" />

          <label className={styles.label} htmlFor="password">Contraseña</label>
          <input className={styles.input} id="password" type="password" placeholder="••••••••" />

          <Button variant="primary" type="submit">Registrarse</Button>

          <p className={styles.footer}>
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </div>
      </section>

      <section className={styles.right}></section>

    </main>
  )
}

export default Register