import React from 'react';
import styles from './Search.module.css';

// Definimos la interfaz de las props
interface BuscadorProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Buscador({ searchTerm, onSearchChange }: BuscadorProps) {
  return (
    <div className={styles.searchContainer}>
      <input
        id='buscador'
        type="text"
        placeholder="Buscar por usuario, email, rol..."
        value={searchTerm}
        onChange={onSearchChange}
        className={styles.searchInput}
      />
    </div>
  );
}