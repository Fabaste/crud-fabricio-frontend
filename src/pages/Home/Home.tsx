import Navigation from '@/components/blocks/Navigation/Navigation'

import styles from './Home.module.css'

function Home() {
    return (
        <main className={styles.container}>
            <Navigation />
            <h1>Hello Home</h1>
        </main>
    )
};

export default Home