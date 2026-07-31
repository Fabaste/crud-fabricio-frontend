import React, { useState } from 'react'
import styles from './PasswordInput.module.css'

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string
}

function PasswordInput({ className = '', ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={styles.wrapper}>
      <input
        {...props}
        className={`${styles.input} ${className}`.trim()}
        type={showPassword ? 'text' : 'password'}
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  )
}

export default PasswordInput
