import { Link } from '@tanstack/react-router'
import styles from './Register.module.css'
import Button from '@/components/ui/Button/Button'

function Register() {
  return (
    <main className={styles.container}>

      <section className={styles.left}>
        <div className={styles.form}>
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

          <Button variant="primary" type="submit">Registrarse</Button>

          <p className={styles.footer}>
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </div>
      </section>

      <section className={styles.right}></section>

    </main>
  )
}

export default Register