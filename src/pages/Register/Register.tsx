import Navigation from '@/components/blocks/Navigation/Navigation'

import styles from '.Register.module.css'

function Register() {
    return (
        <main className={[styles.container, styles.main].join('.')}>
            <Navigation />
            <h1>Hello Register</h1>
        </main>
        
    )
};

export default Register