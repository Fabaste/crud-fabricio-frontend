import styles from './Pagination.module.css';

interface PaginacionProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (targetPage: number) => void;
}

export default function Paginacion({ currentPage, totalPages, onPageChange }: PaginacionProps) {
  return (
    <div className={styles.paginationContainer}>
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.pageButton}
      >
        Anterior
      </button>
      
      <span className={styles.pageNumber}>
        Página {currentPage} de {totalPages || 1}
      </span>

      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className={styles.pageButton}
      >
        Siguiente
      </button>
    </div>
  );
}