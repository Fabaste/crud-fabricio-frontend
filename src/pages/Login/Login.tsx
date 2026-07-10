//import Navigation from '@/components/blocks/Navigation/Navigation'
import { Link } from '@tanstack/react-router'
import styles from './Login.module.css'
import Button from '@/components/ui/Button/Button.tsx'

function Login() {
    return (
        <main className={styles.container}>
             
            <section className={styles.left}>
                <div className={styles.form}>
                <h1 className={styles.title}>Iniciar Sesión</h1>
                <p className={styles.subtitle}>Ingresá tu email y contraseña para continuar</p>

                <label className={styles.label} htmlFor="email">Email</label>
                <input className={styles.input} id="email" type="email" placeholder="tu@email.com" />

                <label className={styles.label} htmlFor="password">Contraseña</label>
                <input className={styles.input} id="password" type="password" placeholder="Contraseña" />

                <Button variant="primary" type="submit">Iniciar Sesión</Button>

                <p className={styles.footer}>
                    ¿No tenés cuenta? <Link to="/register">Registrate</Link>
                </p>
                </div>
            </section>

            <section className={styles.right}>

                LADO DERECHO DE LA PÁGINA
            </section>

        </main>
    )
}

export default Login