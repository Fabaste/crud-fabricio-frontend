import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import styles from './Register.module.css'
import Button from '@/components/ui/Button/Button'
import PasswordInput from '@/components/ui/PasswordInput/PasswordInput'
import { createUser } from '@/api/createUser'

import logo from '@/assets/logoFRS.png'

const GENEROS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
]

const PAISES = [{ value: 'Argentina', label: 'Argentina' }]
const PROVINCIAS_POR_PAIS: Record<string, Array<{ value: string; label: string }>> = {
  Argentina: [
    { value: 'Santa Fe', label: 'Santa Fe' },
    { value: 'Buenos Aires', label: 'Buenos Aires' },
    { value: 'Córdoba', label: 'Córdoba' },
  ],
}
const LOCALIDADES_POR_PROVINCIA: Record<string, Array<{ value: string; label: string }>> = {
  'Santa Fe': [
    { value: 'Santa Fe', label: 'Santa Fe' },
    { value: 'Rosario', label: 'Rosario' },
  ],
  'Buenos Aires': [
    { value: 'La Plata', label: 'La Plata' },
    { value: 'Mar del Plata', label: 'Mar del Plata' },
  ],
  'Córdoba': [
    { value: 'Córdoba', label: 'Córdoba' },
    { value: 'Villa Carlos Paz', label: 'Villa Carlos Paz' },
  ],
}
const CODIGOS_POSTALES: Record<string, Record<string, Record<string, string>>> = {
  Argentina: {
    'Santa Fe': { 'Santa Fe': '3000', Rosario: '2000' },
    'Buenos Aires': { 'La Plata': '1900', 'Mar del Plata': '7600' },
    'Córdoba': { 'Córdoba': '5000', 'Villa Carlos Paz': '5152' },
  },
}

function Register() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [genero, setGenero] = useState('M')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [edad, setEdad] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [pais, setPais] = useState('Argentina')
  const [provincia, setProvincia] = useState('Santa Fe')
  const [localidad, setLocalidad] = useState('Santa Fe')
  const [codigoPostal, setCodigoPostal] = useState('3000')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await createUser({
        nombre,
        apellido,
        email,
        password,
        fechaNacimiento,
        edad: Number(edad),
        genero,
        telefono,
        direccion,
        codigoPostal,
        localidad,
        provincia,
        pais,
        role: 'USER',
      } as any)
      navigate({ to: '/login' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.container}>
      <section className={styles.left}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Crear Cuenta</h1>
          <p className={styles.subtitle}>Completá tus datos para registrarte</p>

          <div className={styles.formRow}>
            <div>
              <label className={styles.label} htmlFor="name">Nombre</label>
              <input className={styles.input} id="name" type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label className={styles.label} htmlFor="lastname">Apellido</label>
              <input className={styles.input} id="lastname" type="text" placeholder="Tu apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </div>
          </div>

          <div className={styles.formRow}>
            <div>
              <label className={styles.label} htmlFor="email">Email</label>
              <input className={styles.input} id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className={styles.label} htmlFor="password">Contraseña</label>
              <PasswordInput className={styles.input} id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
 
          <div className={styles.formRow}>
            <div>        
              <label className={styles.label} htmlFor="genero">Género</label>
              <select className={styles.input} id="genero" value={genero} onChange={(e) => setGenero(e.target.value)} required>
                {GENEROS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label} htmlFor="fechaNacimiento">Fecha de nacimiento</label>
              <input className={styles.input} id="fechaNacimiento" type="date" value={fechaNacimiento} onChange={(e) => {
                const nextValue = e.target.value
                setFechaNacimiento(nextValue)
                const today = new Date()
                const birthDate = new Date(nextValue)
                let calculatedAge = today.getFullYear() - birthDate.getFullYear()
                const monthDiff = today.getMonth() - birthDate.getMonth()
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  calculatedAge -= 1
                }
                setEdad(String(Number.isNaN(calculatedAge) ? '' : calculatedAge))
              }} required />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div>  
              <label className={styles.label} htmlFor="edad">Edad</label>
              <input className={styles.input} id="edad" type="number" min={1} max={120} value={edad} readOnly required />
            </div>
            <div>
              <label className={styles.label} htmlFor="telefono">Teléfono</label>
              <input className={styles.input} id="telefono" type="text" placeholder="1122334455" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div> 
              <label className={styles.label} htmlFor="direccion">Dirección</label>
              <input className={styles.input} id="direccion" type="text" placeholder="Calle 123" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
            </div>
            <div>
              <label className={styles.label} htmlFor="pais">País</label>
              <select className={styles.input} id="pais" value={pais} onChange={(e) => {
                const nextPais = e.target.value
                const nextProvincia = PROVINCIAS_POR_PAIS[nextPais]?.[0]?.value ?? ''
                const nextLocalidad = LOCALIDADES_POR_PROVINCIA[nextProvincia]?.[0]?.value ?? ''
                setPais(nextPais)
                setProvincia(nextProvincia)
                setLocalidad(nextLocalidad)
                setCodigoPostal(CODIGOS_POSTALES[nextPais]?.[nextProvincia]?.[nextLocalidad] ?? '')
              }} required>
                {PAISES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div> 
              <label className={styles.label} htmlFor="provincia">Provincia</label>
              <select className={styles.input} id="provincia" value={provincia} onChange={(e) => {
                const nextProvincia = e.target.value
                const nextLocalidad = LOCALIDADES_POR_PROVINCIA[nextProvincia]?.[0]?.value ?? ''
                setProvincia(nextProvincia)
                setLocalidad(nextLocalidad)
                setCodigoPostal(CODIGOS_POSTALES[pais]?.[nextProvincia]?.[nextLocalidad] ?? '')
              }} required>
                {PROVINCIAS_POR_PAIS[pais]?.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <label className={styles.label} htmlFor="localidad">Localidad</label>
              <select className={styles.input} id="localidad" value={localidad} onChange={(e) => {
                const nextLocalidad = e.target.value
                setLocalidad(nextLocalidad)
                setCodigoPostal(CODIGOS_POSTALES[pais]?.[provincia]?.[nextLocalidad] ?? '')
              }} required>
                {LOCALIDADES_POR_PROVINCIA[provincia]?.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.label} htmlFor="codigoPostal">Código postal</label>
            <input className={styles.input} id="codigoPostal" type="text" value={codigoPostal} readOnly required />
          </div>
          {error && <p className={styles.error}>{error}</p>}

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <p className={styles.footer}>
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </form>
      </section>

      <section className={styles.right}>
        <div>
          <img src= {logo} alt="Imagen publicitaria" />
        </div>
      </section>
    </main>
  )
}

export default Register