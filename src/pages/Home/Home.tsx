import React, { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import Button from '@/components/ui/Button/Button'
import Modal from '@/components/blocks/Modal/Modal'
import styles from './Home.module.css'
import { getUsers } from '@/api/getUsers'
import { updateUser } from '@/api/updateUser'
import type { User } from '@/api/types'
import { APIProvider, Map, Marker, useApiIsLoaded, useMapsLibrary } from '@vis.gl/react-google-maps'
import {KEY_MAPS} from '@/config/globals.ts'
import Buscador from '@/components/blocks/Search/Search'; // Importa el buscador
import Paginacion from '@/components/blocks/Pagination/Pagination'; // Importa la paginación

const ROLES = ['ROOT', 'ADMIN', 'USER', 'GUEST']

function Home() {
  const navigate = useNavigate()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Usuario seleccionado para ver o editar en el modal
  const [modalUser, setModalUser] = useState<User | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'map' | null>(null)

  // Tipos explícitos de Search y Pagination
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  //Localidad seleccionada para ver en Google Maps
  //const [modalLocalidad, setModalLocalidad] = useState<User | null>(null)

  useEffect(() => {
    // Protección mínima de ruta: sin token no tiene sentido estar acá
    if (!localStorage.getItem('token')) {
      navigate({ to: '/login' })
      return
    }
    // Pedimos los usuarios a la API al montar el componente
    async function loadUsers() {
      try {
        const data = await getUsers()
        setUsers(data)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [navigate])

  function handleLogout() {
    // Cerrar sesión = borrar el token y volver al login
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate({ to: '/login' })
  }

  function openView(user: User) {
    setModalUser(user)
    setModalMode('view')
  }

  function openEdit(user: User) {
    setModalUser(user)
    setModalMode('edit')
  }

  function openMap(user: User) {
    setModalUser(user)
    setModalMode('map')
  }

  function closeModal() {
    setModalMode(null)
    setModalUser(null)
  }

  function handleUserUpdated(updated: User) {
    setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)))
    closeModal()
  }

  return (
    <main className={styles.container}>

      <div className={styles.header}>
        <h1 className={styles.title}>Usuarios</h1>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => navigate({ to: '/createUser' })}>+ Agregar</Button>
          <Button variant="secondary" onClick={handleLogout}>Cerrar sesión</Button>
        </div>
      </div>

      {/* Estados de la petición: cargando → error → vacío → tabla */}
      {loading && <p className={styles.message}>Cargando usuarios...</p>}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && users.length === 0 && (
        <p className={styles.message}>No hay usuarios para mostrar</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Usuario</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Género</th>
                <th className={styles.th}>Localidad</th>
                <th className={styles.th}>Rol</th>
                <th className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.userCell}>
                      {/* La API no devuelve imagen: generamos un avatar con el nombre */}
                      {/*src={`https://ui-avatars.com/api/?name=${user.nombre}+${user.apellido}&background=random`}*/}
                      <img
                        className={styles.avatar}
                        src={`./src/assets/ui-avatars/${user._id}.jpeg`}
                        onError={(e) => {
                          e.currentTarget.onerror = null; // Evita bucles infinitos si la API también falla
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.nombre}+${user.apellido}&background=random`;
                        }}
                        alt={`${user.nombre} ${user.apellido}`}
                      />
                      <span>{user.nombre} {user.apellido}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    {/*<a className={`${styles.actionLink}`} href={`mailto:${user.email}?subject='${ASUNTO}'&body=${MENSAJE}`}>{user.email}</a>*/}
                    <a className={`${styles.actionLink}`} href={`mailto:${user.email}`}>{user.email}</a>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.userCell}>
                      <img
                        className={styles.imagen}
                        src={`./src/assets/ui-genero/${user.genero.toLowerCase()}.png`}
                        alt={`${user.genero}`}
                      />
                    </div>
                  </td>
                  <td className={styles.td}>
                      <a className={`${styles.actionLink}`} onClick={() => openMap(user)}>{user.localidad}</a>
                      {/*{modalMode === 'map' && modalUser && <Ubicacion user={modalUser} />}*/}
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${styles[`badge__${user.role.toLowerCase()}`] ?? ''}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => openView(user)}>Ver</button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                        onClick={() => openEdit(user)}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalMode !== null }
        onClose={closeModal}
        title={modalMode === 'view' ? 'Detalle de usuario' : modalMode === 'edit' ? 'Editar usuario' : ''}
        /*title={modalMode === 'view' ? 'Detalle de usuario' : 'Editar usuario'}*/
      >
        {modalMode === 'view' && modalUser && <UserDetails user={modalUser} />}
        {modalMode === 'edit' && modalUser && (
          <UserEditForm user={modalUser} onCancel={closeModal} onSaved={handleUserUpdated} />
        )}
        {modalMode === 'map' && modalUser && <Ubicacion user={modalUser} onCloseMap={closeModal}/>}
      </Modal>

    </main>
  )
}

// ------------------------------------------------------------
// Vista "Ver": detalle de usuario en modo solo lectura
// ------------------------------------------------------------
function UserDetails({ user }: { user: User }) {
  const fields: [string, string][] = [
    ['Nombre', `${user.nombre} ${user.apellido}`],
    ['Email', user.email],
    ['Rol', user.role],
    ['Género', user.genero],
    ['Edad', String(user.edad)],
    ['Fecha de nacimiento', user.fechaNacimiento?.slice(0, 10)],
    ['Teléfono', user.telefono],
    ['Dirección', user.direccion],
    ['Localidad', user.localidad],
    ['Provincia', user.provincia],
    ['País', user.pais],
    ['Código postal', user.codigoPostal],
  ]

  return (
    <dl className={styles.viewGrid}>
      {fields.map(([label, value]) => (
        <div className={styles.viewRow} key={label}>
          <dt className={styles.viewLabel}>{label}</dt>
          <dd className={styles.viewValue}>{value || '-'}</dd>
        </div>
      ))}
    </dl>
  )
}

// ------------------------------------------------------------
// Vista "Editar": formulario que guarda cambios con updateUser
// El email no se incluye: el backend no permite modificarlo
// ------------------------------------------------------------
function UserEditForm({
  user,
  onCancel,
  onSaved,
}: {
  user: User
  onCancel: () => void
  onSaved: (user: User) => void
}) {
  const [nombre, setNombre] = useState(user.nombre)
  const [apellido, setApellido] = useState(user.apellido)
  const [genero, setGenero] = useState(user.genero)
  const [edad, setEdad] = useState(String(user.edad))
  const [fechaNacimiento, setFechaNacimiento] = useState(user.fechaNacimiento?.slice(0, 10) ?? '')
  const [telefono, setTelefono] = useState(user.telefono)
  const [direccion, setDireccion] = useState(user.direccion)
  const [localidad, setLocalidad] = useState(user.localidad)
  const [provincia, setProvincia] = useState(user.provincia)
  const [pais, setPais] = useState(user.pais)
  const [codigoPostal, setCodigoPostal] = useState(user.codigoPostal)
  const [role, setRole] = useState(user.role)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const updated = await updateUser(user._id, {
        nombre,
        apellido,
        genero,
        edad: Number(edad),
        fechaNacimiento: fechaNacimiento,
        telefono,
        direccion,
        localidad,
        provincia,
        pais,
        codigoPostal,
        role,
      })
      onSaved(updated)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.editForm} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <div>
          <label className={styles.label} htmlFor="edit-nombre">Nombre</label>
          <input
            className={styles.input}
            id="edit-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={styles.label} htmlFor="edit-apellido">Apellido</label>
          <input
            className={styles.input}
            id="edit-apellido"
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div>
          <label className={styles.label} htmlFor="edit-genero">Género</label>
          <input
            className={styles.input}
            id="edit-genero"
            type="text"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={styles.label} htmlFor="edit-edad">Edad</label>
          <input
            className={styles.input}
            id="edit-edad"
            type="number"
            min={1}
            max={120}
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div>
          <label className={styles.label} htmlFor="edit-fechaNacimiento">Fecha de nacimiento</label>
          <input
            className={styles.input}
            id="edit-fechaNacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={styles.label} htmlFor="edit-telefono">Teléfono</label>
          <input
            className={styles.input}
            id="edit-telefono"
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>
      </div>

      <label className={styles.label} htmlFor="edit-direccion">Dirección</label>
      <input
        className={styles.input}
        id="edit-direccion"
        type="text"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        required
      />

      <div className={styles.formRow}>
        <div>
          <label className={styles.label} htmlFor="edit-localidad">Localidad</label>
          <input
            className={styles.input}
            id="edit-localidad"
            type="text"
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={styles.label} htmlFor="edit-provincia">Provincia</label>
          <input
            className={styles.input}
            id="edit-provincia"
            type="text"
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div>
          <label className={styles.label} htmlFor="edit-pais">País</label>
          <input
            className={styles.input}
            id="edit-pais"
            type="text"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={styles.label} htmlFor="edit-codigoPostal">Código postal</label>
          <input
            className={styles.input}
            id="edit-codigoPostal"
            type="text"
            value={codigoPostal}
            onChange={(e) => setCodigoPostal(e.target.value)}
            required
          />
        </div>
      </div>

      <label className={styles.label} htmlFor="edit-role">Rol</label>
      <select
        className={styles.select}
        id="edit-role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.modalActions}>
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}


// ------------------------------------------------------------
// Vista "Mapa": Mapa de Google
// ------------------------------------------------------------
const modalStyles : { 
  overlay: React.CSSProperties 
  content: React.CSSProperties
  closeBtn: React.CSSProperties
  } = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
  content: {
    backgroundColor: '#fff', padding: '20px', borderRadius: '8px',
    width: '500px', maxWidth: '90%', position: 'relative'
  },
  closeBtn: {
    position: 'absolute', top: '0px', right: '0px', background: 'red',
    color: '#fff', border: 'none', padding: '0px 5px', cursor: 'pointer', borderRadius: '4px'
  }
};


function Ubicacion({ user, onCloseMap }: { user: User; onCloseMap: () => void }) { 
  const [isOpen, setIsOpen] = useState(true); 
  const position = { lat: -29.1414, lng: -59.6437 }; // Coordenadas de ejemplo (Avellaneda, Santa Fe) 
  /*const position = MapaPorNombre(`"${user.localidad}, ${user.provincia}"`); 
  // Coordenadas de ejemplo (Avellaneda, Santa Fe)*/ 
  /*const geocodingLibrary = useMapsLibrary('geocoding'); 
  const [geocoder, setGeocoder] = useState(null); 
  const [center, setCenter] = useState({ lat: 0, lng: 0 }); 
  // Centro inicial*/ 
  return ( 
    <div style={{ padding: '20px' }}> 
      {/*<button onClick={() => setIsOpen(true)}>Abrir Mapa en Modal</button>*/} 
      {isOpen && ( 
        <div style={modalStyles.overlay}> 
          <div style={modalStyles.content}> 
            <button style={modalStyles.closeBtn} onClick={() => {setIsOpen(false); onCloseMap()}} >X</button> 
            
            <APIProvider apiKey={KEY_MAPS}> 
              <div style={{ width: '100%', height: '400px' }}> 
                <Map defaultCenter={position} defaultZoom={13}> 
                  <Marker position={position} /> 
                </Map> 
              </div> 
            </APIProvider> 
          </div> 
        </div> 
      )}
    </div>
  ); }


/*
// 1. COMPONENTE CONTENEDOR (Recibe las props originales)
function Ubicacion({ user, onCloseMap }: { user: User; onCloseMap: () => void }) {
  const [isOpen, setIsOpen] = useState(true);
  //const position = { lat: -29.1414, lng: -59.6437 }; // Coordenadas de ejemplo (Avellaneda, Santa Fe)
  
  if (!isOpen) return null;

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => setIsOpen(true)}>Abrir Mapa en Modal</button>

      {isOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <button style={modalStyles.closeBtn} onClick={() => {setIsOpen(false); onCloseMap()}} >X</button>
            
            <APIProvider apiKey={KEY_MAPS} solutionChannel="GMP_visgl_rgm_v1" libraries={['geocoding']}>
              <MapaInterno user={user} />
            </APIProvider>
          </div>
        </div>
      )}
    </div>
  );
}

function MapaInterno({ user }: { user: any }) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Este hook monitorea directamente el estado global del APIProvider
  const apiIsLoaded = useApiIsLoaded();

  useEffect(() => {
    // Si la API de Google Maps no ha terminado de descargarse en el navegador, esperamos
    if (!apiIsLoaded) return;

    try {
      // Accedemos directamente al constructor global de Google (ya disponible en el window)
      const geocoder = new window.google.maps.Geocoder();
      const addressString = `${user.localidad}, ${user.provincia}, Argentina`;

      geocoder.geocode({ address: addressString }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setPosition({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          setErrorMsg(`Error de Google Geocoding: ${status}`);
          console.error('Status recibido:', status);
        }
      });
    } catch (err: any) {
      setErrorMsg(`Error al inicializar Geocoder: ${err.message}`);
    }
  }, [apiIsLoaded, user.localidad, user.provincia]);

  // Manejo de estados visuales dinámicos
  if (errorMsg) {
    return (
      <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
        {errorMsg}
      </div>
    );
  }

  if (!position) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        {apiIsLoaded ? "Buscando coordenadas exactas..." : "Conectando con Google Maps..."}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Map defaultCenter={position} defaultZoom={13} center={position}>
        <Marker position={position} />
      </Map>
    </div>
  );
}
*/



/*// 2. COMPONENTE INTERNO (Aquí los useEffects responderán correctamente)
function MapaInterno({ user }: { user: any }) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const geocodingLibrary = useMapsLibrary('geocoding');
  const [geocoder, setGeocoder] = useState<any>(null);

  // Se dispara cuando la librería externa de Google termina de cargar en el proveedor
  useEffect(() => {
    if (!geocodingLibrary) return;
    setGeocoder(new geocodingLibrary.Geocoder());
  }, [geocodingLibrary]);

  // Se dispara cuando el geocoder está listo o cambia el usuario
  useEffect(() => {
    if (!geocoder) return;

    const addressString = `${user.localidad}, ${user.provincia}, ${user.pais}`;

    geocoder.geocode({ address: addressString }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        setPosition({
          lat: location.lat(),
          lng: location.lng()
        });
      } else {
        console.error('Error de Geocoding: ' + status);
      }
    });
  }, [geocoder, user.localidad, user.provincia, user.pais]);

  // Si no se han conseguido las coordenadas, se muestra el estado de carga
  if (!position) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        Error al cargar el mapa
      </div>
    );
  }

  // Cuando las coordenadas llegan, se renderiza el mapa inmediatamente
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Map defaultCenter={position} defaultZoom={13} center={position}>
        <Marker position={position} />
      </Map>
    </div>
  );
}*/



/*function MapaPorNombre(localidad) {
  // Carga la librería de geocodificación interna de Google Maps
  const geocodingLibrary = useMapsLibrary('geocoding');
  const [geocoder, setGeocoder] = useState(null);
  const [center, setCenter] = useState({ lat: 0, lng: 0 }); // Centro inicial

  // Inicializa el geocodificador cuando la librería de Google esté lista
  useEffect(() => {
    if (!geocodingLibrary) return;
    setGeocoder(new geocodingLibrary.Geocoder());
  }, [geocodingLibrary]);

  // Ejecuta la búsqueda cada vez que cambie la propiedad "localidad"
  useEffect(() => {
    if (!geocoder || !localidad) return;

    geocoder.geocode({ 'address': localidad }, (results, status) => {
      if (status === 'OK' && results[0]) {
        // Extrae las coordenadas exactas de la respuesta de Google
        const { lat, lng } = results[0].geometry.location;
        
        // Actualiza el estado para centrar el mapa
        setCenter({ lat: lat(), lng: lng() });
      } else {
        console.error('Error al geocodificar la localidad:', status);
      }
    });
  }, [geocoder, localidad]);

  return  { center }
  (
    <div style={{ height: '500px', width: '100%' }}>
      <Map
        zoom={12}
        center={center}
        gestureHandling={'cooperative'}
        disableDefaultUI={false}
      />
    </div>
  );
}*/



export default Home