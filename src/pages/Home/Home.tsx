import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import Button from '@/components/ui/Button/Button'
import Modal from '@/components/blocks/Modal/Modal'
import styles from './Home.module.css'
import { getUsers } from '@/api/getUsers'
import { updateUser } from '@/api/updateUser'
import type { User } from '@/api/types'

const ROLES = ['ROOT', 'ADMIN', 'USER', 'GUEST']

function Home() {
  const navigate = useNavigate()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Usuario seleccionado para ver o editar en el modal
  const [modalUser, setModalUser] = useState<User | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | null>(null)

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
                      <img
                        className={styles.avatar}
                        src={`https://ui-avatars.com/api/?name=${user.nombre}+${user.apellido}&background=random`}
                        alt={`${user.nombre} ${user.apellido}`}
                      />
                      <span>{user.nombre} {user.apellido}</span>
                    </div>
                  </td>
                  <td className={styles.td}>{user.email}</td>
                  <td className={styles.td}>{user.genero}</td>
                  <td className={styles.td}>{user.localidad}</td>
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
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'view' ? 'Detalle de usuario' : 'Editar usuario'}
      >
        {modalMode === 'view' && modalUser && <UserDetails user={modalUser} />}
        {modalMode === 'edit' && modalUser && (
          <UserEditForm user={modalUser} onCancel={closeModal} onSaved={handleUserUpdated} />
        )}
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
        fechaNacimiento,
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

export default Home