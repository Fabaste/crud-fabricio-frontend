//import Navigation from '@/components/blocks/Navigation/Navigation'
import { Link } from '@tanstack/react-router'
import styles from '.Login.module.css'
import Button from '@/components/ui/Button/Button'

function Login() {
    return (
        <main className={styles.container}>
            <section>
                <div>
                    <Navigation />
                    <h1>Hello Login</h1>

                    <label className={styles.label} htmlFor="email">Email</label>
                    <label className={styles.input} id="email" type="email" placeholder="tu@email.com"/>
                    
                    <label className={styles.label} htmlFor="password">Contraseña</label>
                    <label className={styles.input} id="password" type="password" placeholder="Contraseña"/>

                    <button type="submit">Iniciar Sesión</button>

                    <p className={styles.footer}>
                        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
                    </p>
                </div>
            </section>
            <section className={styles.right}></section>
        </main>
    )
};

export default Login