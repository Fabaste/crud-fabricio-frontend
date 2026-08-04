//import { Link } from '@tanstack/react-router'
import { useState, useEffect, type FormEvent} from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import styles from './Register.module.css'
import Button from '@/components/ui/Button/Button'
import PasswordInput from '@/components/ui/Input/PasswordInput'
import { registerUser, verificarCodigo } from '@/api/register'

import toast, { Toaster } from 'react-hot-toast';
import logo from '../Login/assets/logoFRS.png'
import { Country, State, City, ICountry, IState, ICity  } from 'country-state-city';

const GENEROS = [
  { value: "", disabled: true, selected: true, label: "Selecciona un género..." },  
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'X', label: 'Otros' },
] 

function Register() {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [genero, setGenero] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [edad, setEdad] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [pais, setPais] = useState<string>('')
  const [provincia, setProvincia] = useState<string>('')
  const [localidad, setLocalidad] = useState<string>('')
  const [codigoPostal, setCodigoPostal] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [paises, setPaises] = useState<ICountry[]>([]);
  const [provincias, setProvincias] = useState<IState[]>([]);
  const [localidades, setLocalidades] = useState<ICity[]>([]);
  
  const [paisCodigo, setPaisCodigo] = useState('');
  const [provinciaCodigo, setProvinciaCodigo] = useState('');

  
  // ESTADOS DEL FLUJO DEL MODAL Y VERIFICACIÓN
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tokenTemporal, setTokenTemporal] = useState('');
  const [codigoIngresado, setCodigoIngresado] = useState('');

  // 1. Cargar todos los países al montar el componente
  useEffect(() => {
    setPaises(Country.getAllCountries());
  }, []);

  // 2. Escuchar cuando cambie el país para cargar sus provincias/estados
  useEffect(() => {
    if (paisCodigo) {
      setProvincias(State.getStatesOfCountry(paisCodigo));
      setLocalidades([]); // Resetear localidades previas
      setProvinciaCodigo('');
      setProvincia('');
    } else {
      setProvincias([]);
      setLocalidades([]);
    }
  }, [paisCodigo]);

  // 3. Escuchar cuando cambie la provincia para cargar sus ciudades/localidades
  useEffect(() => {
    if (paisCodigo && provinciaCodigo) {
      setLocalidades(City.getCitiesOfState(paisCodigo, provinciaCodigo));
    } else {
      setLocalidades([]);
    }
  }, [paisCodigo, provinciaCodigo]);

  // --- SUBMIT 1: ENVIAR DATOS FORMULARIO AL BACKEND ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null)
    setLoading(true)
    const idToast = toast.loading('Procesando datos y enviando correo...');

    try {
      const data = (await registerUser({
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
      })) as Record<string, any>;
     
      const token = data.tokenTemporal || data.token || ''

      if (!token) {
        throw new Error(data.message || 'No se pudo iniciar la verificación')
      }
      // Guardamos el token identificador que nos dió el backend
      setTokenTemporal(token);
      
      toast.success('¡Código enviado! Revisa tu bandeja.', { id: idToast });
      
      // Abrimos el modal para ingresar el código con un pequeño delay
      setTimeout(() => setMostrarModal(true), 1500);

    } catch (error: any) {
      setError(error.message)
      toast.error(error.message, { id: idToast });
    }finally {
      setLoading(false)
    }
  };

  // --- SUBMIT 2: ENVIAR CÓDIGO AL BACKEND ---
  const manejarVerificarCodigo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null)
    setLoading(true)
    const idToast = toast.loading('Validando código de seguridad...');

    try {

      if (!tokenTemporal) {
        throw new Error('No hay un token temporal válido')
      }
      const data = await verificarCodigo(tokenTemporal, codigoIngresado) as Record<string, any>
      
    if (data?.success === false || data?.ok === false) {
      throw new Error(data?.message || 'Código inválido')
    }

    toast.success('¡Registro completado con éxito! Redirigiendo...', { id: idToast })
    setMostrarModal(false)
    setCodigoIngresado('')

      // Redirección definitiva al Login de tu app
    setTimeout(() => {
      navigate({ to: '/login' })
    }, 2500)

    } catch (error: any) {
      setError(error.message)
      toast.error(error.message, { id: idToast });
    } finally {
      setLoading(false)
    }
  };


  /*async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // 1. Mostrar toast de carga
    const idToast = toast.loading('Enviando código de verificación...');

    // 2. Generar un código aleatorio de 6 dígitos
    const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
    

    try {
      await registerUser({
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
      }) as any

      navigate({ to: '/login' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }*/

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
          <div className={`${styles.formRow} ${styles.inputBox}`}>
            <div>        
              <label className={styles.label} htmlFor="genero">Género</label>
              <select className={styles.input} id="genero"  value={genero} onChange={(e) => setGenero(e.target.value)} required>
                {GENEROS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
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
              {/*<input className={styles.input} id="pais" type="text" placeholder="Argentina" value={pais} onChange={(e) => setPais(e.target.value)} required />*/}
              <select 
                className={styles.input}
                /*value={pais} 
                onChange={(e) => setPais(e.target.value)}*/
                value={pais ? `${paisCodigo}_${pais}` : ""} 
                onChange={(e) => {
                  const valorCompleto = e.target.value;
                  if (valorCompleto) {
                    const [codigo, nombre] = valorCompleto.split('_');
                    setPaisCodigo(codigo); // Guardamos el código para los useEffect
                    setPais(nombre);       // Tu variable 'pais' ahora guarda el NOMBRE
                  } else {
                    setPaisCodigo('');
                    setPais('');
                  }
                }} required
              >
                <option value="">Selecciona un país</option>
                {paises.map((p) => (
                  <option key={p.isoCode} value={`${p.isoCode}_${p.name}`}>
                    {p.name}
                    {/*{p.flag} {p.name}*/}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div> 
              <label className={styles.label} htmlFor="provincia">Provincia</label>
              {/*<input className={styles.input} id="provincia" type="text" placeholder="Buenos Aires" value={provincia} onChange={(e) => setProvincia(e.target.value)} required />*/}
              <select 
                className={styles.input}
                disabled={!pais}
                /*value={provincia} 
                onChange={(e) => setProvincia(e.target.value)}*/
                value={provincia ? `${provinciaCodigo}_${provincia}` : ""} 
                onChange={(e) => {
                  const valorCompleto = e.target.value;
                  if (valorCompleto) {
                    const [codigo, nombre] = valorCompleto.split('_');
                    setProvinciaCodigo(codigo); // Guardamos el código para los useEffect
                    setProvincia(nombre);       // Tu variable 'provincia' ahora guarda el NOMBRE
                  } else {
                    setProvinciaCodigo('');
                    setProvincia('');
                  }
                }} required
              >
                <option value="">Selecciona una provincia</option>
                {provincias.map((p) => (
                  <option key={p.isoCode} value={`${p.isoCode}_${p.name}`}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label} htmlFor="localidad">Localidad</label>
              {/*<input className={styles.input} id="localidad" type="text" placeholder="Ciudad de Buenos Aires" value={localidad} onChange={(e) => setLocalidad(e.target.value)} required />*/}
              <select 
                className={styles.input}
                value={localidad} 
                disabled={!provincia}
                onChange={(e) => setLocalidad(e.target.value)}
                required
              >
                <option value="">Selecciona una localidad</option>
                {localidades.map((l) => (
                  <option key={l.name} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div>
              <label className={styles.label} htmlFor="codigoPostal">Código postal</label>
              <input className={styles.input} id="codigoPostal" type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} required />
            </div>
            <div>
              <label className={`${styles.label} ${styles.visuallyHidden}`} htmlFor="role">Role</label>
              <input className={`${styles.input} ${styles.visuallyHidden}`} id="role" type="text" value= "USER" required />
            </div>
          </div>
          {error && <p className={styles.error}>{error}</p>}

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <p className={styles.footer}>
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </form>

        {/* MODAL DE CONFIRMACIÓN DE CÓDIGO */}
        {mostrarModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContenido}>
            <h5 style={{ fontSize: 'clamp(16px, 1.5vw + 10px, 22px)', margin: '0 0 15px 0' }}>
              Confirmación por Correo
            </h5>
            <p>Ingresa el código de 6 dígitos enviado a tu email. Expira en 5 minutos.</p>
            
            <form onSubmit={manejarVerificarCodigo}>
              <input 
                className={styles.input}
                type="text" 
                maxLength={6} 
                placeholder="000000"
                value={codigoIngresado} 
                onChange={(e) => setCodigoIngresado(e.target.value)}
                required
                style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '20px' }}
              />
              <div className={styles.botonContenedor} style={{ marginTop: '20px' }}>
                <button type="submit" className={styles.botonEnviar} disabled={loading}>
                  {loading ? 'Verificando...' : 'Verificar Código'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </section>

      <section className={styles.right}>
        <div className={styles.adsContent}>
          <img className={styles.promoLogo} src= {logo} alt="Logo" />
          <div className={styles.adsText}>
            <h5>INGENIERIA DE SOFTWARE</h5>
          </div>
        </div>
        <div className={styles.stackFooter}>
          <img className={`${styles.stackIcon} ${styles.mongodb}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/mongodb/default.svg" title="MongoDB" alt="MongoDB" />
          <img className={`${styles.stackIcon} ${styles.react}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/react/default.svg" title="React" alt="React" />
          <img className={`${styles.stackIcon} ${styles.typescript}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/typescript/default.svg" title="TypeScript" alt="TypeScript" />
          <img className={`${styles.stackIcon} ${styles.node}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/nodejs/wordmark.svg" title="Node.js" alt="Node.js" />
          <img className={`${styles.stackIcon} ${styles.express}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/expressdotjs/light.svg" title="Express.js" alt="Express.js" />
          <img className={`${styles.stackIcon} ${styles.vite}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/vite/default.svg" title="Vite" alt="Vite" />
          <img className={`${styles.stackIcon} ${styles.cssmodules}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/css-new/default.svg" title="CSS Modules" alt="CSS Modules" />
          <img className={`${styles.stackIcon} ${styles.tanstack}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/tanstack/default.svg" title="TanStack" alt="TanStack" />
          <img className={`${styles.stackIcon} ${styles.javascript}`} src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/javascript/default.svg" title="JavaScript" alt="JavaScript" />
        </div>
      </section>

    </main>
  )
}

export default Register