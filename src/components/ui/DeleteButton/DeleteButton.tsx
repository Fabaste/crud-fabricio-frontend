import styles from './DeleteButton.module.css'

// Definición de las propiedades del componente
interface DeleteButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

function DeleteButton  ({
  onClick,
  ariaLabel = "Eliminar elemento",
  className = "",
  disabled = false,
}:DeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${styles.deleteBtn}`}
    >
      {/* Icono SVG de tacho de basura */}
      <svg
        xmlns="http://w3.org"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${styles.deleteIcon}`}
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  );
};


export default DeleteButton