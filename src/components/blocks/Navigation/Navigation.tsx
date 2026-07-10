import { Link } from '@tanstack/react-router'

import styles from './Navigation.module.css'

function Navigation () {
    return (
        <nav className = {styles.nav}>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
        </nav>
    )
}

export default Navigation