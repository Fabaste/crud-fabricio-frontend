import React, { useState } from 'react'
import styles from './PasswordInput.module.css'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string
}

function PasswordInput({ className = '', ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)



  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };



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

        onClick={togglePasswordVisibility}
      >
        {/*onClick={() => setShowPassword((prev) => !prev)}*/}
        {/*{showPassword ? 'Ocultar' : 'Mostrar'}*/}
        
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}

export default PasswordInput