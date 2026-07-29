import styles from './Paginacion.module.css';

interface PaginacionProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (targetPage: number) => void;
}

export default function Paginacion({ currentPage, totalPages, onPageChange }: PaginacionProps) {
  return (
    <div className={styles.pagination}>
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.pageBtn}
      >
        Anterior
      </button>
      
      <span className={styles.pageInfo}>
        Página {currentPage} de {totalPages || 1}
      </span>

      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className={styles.pageBtn}
      >
        Siguiente
      </button>
    </div>
  );
}