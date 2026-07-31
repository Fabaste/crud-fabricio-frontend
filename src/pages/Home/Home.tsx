import React, { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import Button from '@/components/ui/Button/Button'
import DeleteButton from '@/components/ui/DeleteButton/DeleteButton'
import PasswordInput from '@/components/ui/PasswordInput/PasswordInput'
import Modal from '@/components/blocks/Modal/Modal'
import styles from './Home.module.css'
import { getUsers } from '@/api/getUsers'
import { updateUser } from '@/api/updateUser'
import { createUser } from '@/api/createUser'
import { deleteUser } from '@/api/deleteUser'
import type { User } from '@/api/types'
import { APIProvider, Map, Marker} from '@vis.gl/react-google-maps'
import {KEY_MAPS} from '@/config/globals.ts'
import Buscador from '@/components/blocks/Search/Search'; // Importa el buscador
import Paginacion from '@/components/blocks/Pagination/Pagination'; // Importa la paginación

const ROLES = [
  {value:'ROOT', label: 'Root'},
  {value:'ADMIN', label: 'Administrador'},
  {value:'USER', label: 'Usuario'},
  {value:'GUEST', label: 'Invitado'},
]

const GENEROS = [
  {value:'M', label: 'Masculino'},
  {value:'F', label: 'Femenino'},
]

function formatDateForInput(value?: string | Date | null) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function formatDateForDisplay(value?: string | Date | null) {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function calculateAgeFromBirthDate(value?: string) {
  if (!value) return ''
  const birthDate = new Date(value)
  if (Number.isNaN(birthDate.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return String(age)
}

function Home() {
  const navigate = useNavigate()

  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!successMessage) return

    const timer = window.setTimeout(() => {
      setSuccessMessage(null)
    }, 2500)

    return () => window.clearTimeout(timer)
  }, [successMessage])

  // Usuario seleccionado para ver o editar en el modal
  const [modalUser, setModalUser] = useState<User | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'map' | 'create' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  //Localidad seleccionada para ver en Google Maps
  //const [modalLocalidad, setModalLocalidad] = useState<User | null>(null)

  async function refreshUsers() {
    try {
      const data = await getUsers()
      const normalizedUsers = Array.isArray(data) ? data : data ? [data] : []
      setUsers(normalizedUsers)
      const storedEmail = localStorage.getItem('userEmail') || ''
      const me = normalizedUsers.find((user) => user.email === storedEmail) ?? null
      setCurrentUser(me)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Protección mínima de ruta: sin token no tiene sentido estar acá
    if (!localStorage.getItem('token')) {
      navigate({ to: '/login' })
      return
    }
    refreshUsers()
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

  function openEdit(user: User | null) {
    setModalUser(user)
    setModalMode(user ? 'edit' : 'create')
  }

  function openMap(user: User) {
    setModalUser(user)
    setModalMode('map')
  }

  function closeModal() {
    setModalMode(null)
    setModalUser(null)
  }

  async function handleUserUpdated(updated: User, action: 'create' | 'edit' = 'edit') {
    setError(null)
    try {
      await refreshUsers()
      setCurrentPage(1)
      setSuccessMessage(action === 'create' ? 'Usuario creado correctamente' : 'Usuario actualizado correctamente')
    } catch (err: any) {
      setError(err.message || 'No se pudo refrescar la tabla')
    } finally {
      closeModal()
    }
  }

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteUser(deleteTarget.id)
      await refreshUsers()
      setCurrentPage(1)
      setDeleteTarget(null)
      setError(null)
      setSuccessMessage(`Usuario eliminado correctamente: ${deleteTarget.name}`)
    } catch (err: any) {
      setError(err.message || 'No se pudo eliminar el usuario')
      setDeleteTarget(null)
      setSuccessMessage(null)
    }
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const role = (localStorage.getItem('role') || 'USER').toUpperCase()
  const isRoot = role === 'ROOT'
  const isAdmin = role === 'ADMIN'
  const isUser = role === 'USER'
  const currentUserId = currentUser?._id || localStorage.getItem('userId') || ''

  // Lógica de filtrado (Se queda aquí para procesar los datos)
  //const filteredUsers = (users || []).filter((user) => {
  const filteredUsers = Array.isArray(users)
  ? users.filter((user) => {
    const searchString = `${user.nombre} ${user.apellido} ${user.email} ${user.role} ${user.localidad}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }): [];

  // Lógica de paginación (Se queda aquí para calcular los cortes)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Tipos explícitos de Search y Pagination
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const canViewUser = (user: User) => {
    if (isRoot || isAdmin) return true
    if (isUser) return user._id === currentUserId
    return false
  }

  const canEditUser = (user: User) => {
    if (isRoot) return true
    if (isAdmin) return user.role !== 'ROOT' && user.role !== 'ADMIN'
    if (isUser) return user._id === currentUserId
    return false
  }

  const canDeleteUser = (user: User) => {
    if (isRoot) return user._id !== currentUserId
    if (isAdmin) return user.role !== 'ROOT' && user.role !== 'ADMIN' && user._id !== currentUserId
    return false
  }

  return (
    <main className={styles.container}>

      {currentUser && (
        <section className={styles.userCard}>
          <div>
            <p className={styles.userCardLabel}>Usuario logueado</p>
            <h2 className={styles.userCardName}>{currentUser.nombre} {currentUser.apellido}</h2>
          </div>
          <span className={`${styles.badge} ${styles[`badge__${currentUser.role.toLowerCase()}`] ?? ''}`}>
            {currentUser.role}
          </span>
        </section>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Usuarios</h1>
       {/* --- Componente Search --- */}
        <Buscador
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <div className={styles.headerActions}>
          {/*<Button variant="primary" onClick={() => navigate({ to: '/createUser' })}>+ Agregar</Button>*/}
          <Button variant="primary" onClick={() => openEdit(null)}>+ Agregar</Button>
          <Button variant="secondary" onClick={handleLogout}>Cerrar sesión</Button>
        </div>
      </div>


      {/* Estados de la petición: cargando → error → vacío → tabla */}
      {loading && <p className={styles.message}>Cargando usuarios...</p>}

      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}

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
              {/*</tbody>{users.map((user) => (*/}
                {currentUsers.map((user) => (
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
                      {canViewUser(user) && <button className={styles.actionBtn} onClick={() => openView(user)}>Ver</button>}
                      {canEditUser(user) && (
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                          onClick={() => openEdit(user)}
                        >
                          Editar
                        </button>
                      )}
                      {canDeleteUser(user) && <DeleteButton onClick={() => handleDelete(user._id, user.nombre)}>Borrar</DeleteButton>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

           {/* --- Componente Pagination --- */}
          <Paginacion
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(targetPage) => setCurrentPage(targetPage)}
          />
        </div>
      )}

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar eliminación"
      >
        <div className={styles.confirmContent}>
          <p className={styles.confirmText}>
            ¿Deseas eliminar a <strong>{deleteTarget?.name}</strong>?
          </p>
          <div className={styles.confirmActions}>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="primary" onClick={confirmDelete}>Eliminar</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalMode !== null }
        onClose={closeModal}
        title={modalMode === 'view' ? 'Detalle de usuario' : modalMode === 'edit' ? 'Editar usuario' : modalMode === 'create' ? 'Crear usuario' :''}
        /*title={modalMode === 'view' ? 'Detalle de usuario' : 'Editar usuario'}*/
      >
        {modalMode === 'view' && modalUser && <UserDetails user={modalUser} />}
        {modalMode === 'edit' && modalUser && (
          <UserEditForm user={modalUser} onCancel={closeModal} onSaved={handleUserUpdated} />
        )}
        {modalMode === 'create' && (
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
    ['Fecha de nacimiento', formatDateForDisplay(user.fechaNacimiento)],
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
// 1. Cambiamos el tipado para aceptar User | null
function UserEditForm({
  user,
  onCancel,
  onSaved,
}: {
  user: User | null
  onCancel: () => void
  onSaved: (user: User, action?: 'create' | 'edit') => void
}) {
  // 2. Usamos encadenamiento opcional (?.) y valores por defecto para el modo creación
  const [nombre, setNombre] = useState(user?.nombre ?? '')
  const [apellido, setApellido] = useState(user?.apellido ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [genero, setGenero] = useState(user?.genero ?? GENEROS[0].value) //Genero inicial por defecto
  const [edad, setEdad] = useState(String(user?.edad ?? ''))
  const [fechaNacimiento, setFechaNacimiento] = useState(formatDateForInput(user?.fechaNacimiento) ?? '')
  const [telefono, setTelefono] = useState(user?.telefono ?? '')
  const [direccion, setDireccion] = useState(user?.direccion ?? '')
  const [localidad, setLocalidad] = useState(user?.localidad ?? '')
  const [provincia, setProvincia] = useState(user?.provincia ?? '')
  const [pais, setPais] = useState(user?.pais ?? '')
  const [codigoPostal, setCodigoPostal] = useState(user?.codigoPostal ?? '')
  const [role, setRole] = useState(user?.role ?? ROLES[2].value) // Rol inicial por defecto
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // 3. Identificamos si estamos editando o creando
  const isEditing = Boolean(user && user._id)

  /*async function handleSubmit(e: React.FormEvent) {
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
  }*/

  function validateField(field: string, value: string) {
    const nextErrors = { ...errors }

    switch (field) {
      case 'nombre':
        if (!value.trim()) nextErrors.nombre = 'El nombre es obligatorio'
        else if (value.trim().length < 2) nextErrors.nombre = 'Debe tener al menos 2 caracteres'
        else delete nextErrors.nombre
        break
      case 'apellido':
        if (!value.trim()) nextErrors.apellido = 'El apellido es obligatorio'
        else if (value.trim().length < 2) nextErrors.apellido = 'Debe tener al menos 2 caracteres'
        else delete nextErrors.apellido
        break
      case 'email':
        if (!value.trim()) nextErrors.email = 'El email es obligatorio'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) nextErrors.email = 'El formato del email es inválido'
        else delete nextErrors.email
        break
      case 'genero':
        if (!value.trim()) nextErrors.genero = 'El género es obligatorio'
        else delete nextErrors.genero
        break
      case 'edad':
        if (!value) nextErrors.edad = 'La edad es obligatoria'
        else if (Number(value) < 1 || Number(value) > 120) nextErrors.edad = 'La edad debe estar entre 1 y 120'
        else delete nextErrors.edad
        break
      case 'fechaNacimiento':
        if (!value) nextErrors.fechaNacimiento = 'La fecha es obligatoria'
        else delete nextErrors.fechaNacimiento
        break
      case 'telefono':
        if (!value.trim()) nextErrors.telefono = 'El teléfono es obligatorio'
        else if (value.trim().length < 6) nextErrors.telefono = 'Debe tener al menos 6 caracteres'
        else delete nextErrors.telefono
        break
      case 'direccion':
        if (!value.trim()) nextErrors.direccion = 'La dirección es obligatoria'
        else delete nextErrors.direccion
        break
      case 'localidad':
        if (!value.trim()) nextErrors.localidad = 'La localidad es obligatoria'
        else delete nextErrors.localidad
        break
      case 'provincia':
        if (!value.trim()) nextErrors.provincia = 'La provincia es obligatoria'
        else delete nextErrors.provincia
        break
      case 'pais':
        if (!value.trim()) nextErrors.pais = 'El país es obligatorio'
        else delete nextErrors.pais
        break
      case 'codigoPostal':
        if (!value.trim()) nextErrors.codigoPostal = 'El código postal es obligatorio'
        else delete nextErrors.codigoPostal
        break
      case 'password':
        if (!isEditing && !value.trim()) nextErrors.password = 'La contraseña es obligatoria'
        else if (value && value.length < 6) nextErrors.password = 'Debe tener al menos 6 caracteres'
        else delete nextErrors.password
        break
      default:
        break
    }

    setErrors(nextErrors)
  }

  function normalizeBackendError(error: any) {
    const rawMessage = error?.message || ''

    if (typeof rawMessage === 'string') {
      if (rawMessage.includes('"nombre"')) return 'El nombre debe tener al menos 2 caracteres.'
      if (rawMessage.includes('"apellido"')) return 'El apellido debe tener al menos 2 caracteres.'
      if (rawMessage.includes('"email"')) return 'El email no tiene un formato válido.'
      if (rawMessage.includes('"password"')) return 'La contraseña debe tener al menos 6 caracteres.'
      if (rawMessage.includes('"edad"')) return 'La edad debe ser un número válido.'
      if (rawMessage.includes('"telefono"')) return 'El teléfono debe tener al menos 6 caracteres.'
      if (rawMessage.includes('"role"')) return 'El rol seleccionado no es válido.'
      if (rawMessage.includes('Invalid status code')) return 'No se pudo guardar el usuario. Revisa los datos ingresados.'
    }

    return rawMessage || 'No se pudo guardar el usuario.'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const userData = {
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
    }

    try {
      let savedUser: User

      if (isEditing && user) {
        const updatePayload = {
          ...userData,
          ...(password ? { password } : {}),
        }
        savedUser = await updateUser(user._id, updatePayload as any)
      } else {
        const newUserData = { ...userData, email, password }
        savedUser = await createUser(newUserData as any)
      }

      onSaved(savedUser, isEditing ? 'edit' : 'create')
    } catch (error: any) {
      setErrors({ form: normalizeBackendError(error) })
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
            onChange={(e) => {
              setNombre(e.target.value)
              validateField('nombre', e.target.value)
            }}
            required
          />
          {errors.nombre && <p className={styles.fieldError}>{errors.nombre}</p>}
        </div>
        <div>
          <label className={styles.label} htmlFor="edit-apellido">Apellido</label>
          <input
            className={styles.input}
            id="edit-apellido"
            type="text"
            value={apellido}
            onChange={(e) => {
              setApellido(e.target.value)
              validateField('apellido', e.target.value)
            }}
            required
          />
          {errors.apellido && <p className={styles.fieldError}>{errors.apellido}</p>}
        </div>
      </div>

      <div className={styles.formRow}>
        <div>
          <label className={styles.label} htmlFor="edit-genero">Género</label>
          <select
            className={styles.select}
            id="edit-genero"
            value={genero}
            onChange={(e) => {
              setGenero(e.target.value)
              validateField('genero', e.target.value)
            }}
            required
          >
            {GENEROS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
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
            readOnly
            required
          />
          {errors.edad && <p className={styles.fieldError}>{errors.edad}</p>}
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
            onChange={(e) => {
              const nextValue = e.target.value
              setFechaNacimiento(nextValue)
              setEdad(calculateAgeFromBirthDate(nextValue))
              validateField('fechaNacimiento', nextValue)
            }}
            required
          />
          {errors.fechaNacimiento && <p className={styles.fieldError}>{errors.fechaNacimiento}</p>}
        </div>
        <div>
          <label className={styles.label} htmlFor="edit-telefono">Teléfono</label>
          <input
            className={styles.input}
            id="edit-telefono"
            type="text"
            value={telefono}
            onChange={(e) => {
              setTelefono(e.target.value)
              validateField('telefono', e.target.value)
            }}
            required
          />
          {errors.telefono && <p className={styles.fieldError}>{errors.telefono}</p>}
        </div>
      </div>

      <div className={styles.formRow}>
        <div>
          <label className={styles.label} htmlFor="edit-email">Email</label>
          <input
            className={styles.input}
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              validateField('email', e.target.value)
            }}
            placeholder="tu@correo.com"
            required
          />
          {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
        </div>
        <div>
          <label className={styles.label} htmlFor="edit-direccion">Dirección</label>
          <input
            className={styles.input}
            id="edit-direccion"
            type="text"
            value={direccion}
            onChange={(e) => {
              setDireccion(e.target.value)
              validateField('direccion', e.target.value)
            }}
            required
          />
          {errors.direccion && <p className={styles.fieldError}>{errors.direccion}</p>}
        </div>
      </div>

      <div className={styles.formRow}>
        <div>
          <label className={styles.label} htmlFor="edit-localidad">Localidad</label>
          <input
            className={styles.input}
            id="edit-localidad"
            type="text"
            value={localidad}
            onChange={(e) => {
              setLocalidad(e.target.value)
              validateField('localidad', e.target.value)
            }}
            required
          />
          {errors.localidad && <p className={styles.fieldError}>{errors.localidad}</p>}
        </div>
        <div>
          <label className={styles.label} htmlFor="edit-provincia">Provincia</label>
          <input
            className={styles.input}
            id="edit-provincia"
            type="text"
            value={provincia}
            onChange={(e) => {
              setProvincia(e.target.value)
              validateField('provincia', e.target.value)
            }}
            required
          />
          {errors.provincia && <p className={styles.fieldError}>{errors.provincia}</p>}
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
            onChange={(e) => {
              setPais(e.target.value)
              validateField('pais', e.target.value)
            }}
            required
          />
          {errors.pais && <p className={styles.fieldError}>{errors.pais}</p>}
        </div>
        <div>
          <label className={styles.label} htmlFor="edit-codigoPostal">Código postal</label>
          <input
            className={styles.input}
            id="edit-codigoPostal"
            type="text"
            value={codigoPostal}
            onChange={(e) => {
              setCodigoPostal(e.target.value)
              validateField('codigoPostal', e.target.value)
            }}
            required
          />
          {errors.codigoPostal && <p className={styles.fieldError}>{errors.codigoPostal}</p>}
        </div>
      </div>

      <div className={styles.formRow}>
        <div>
          <label className={styles.label} htmlFor="edit-password">Contraseña</label>
          <PasswordInput
            className={styles.input}
            id="edit-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              validateField('password', e.target.value)
            }}
            placeholder={isEditing ? 'Dejar vacío para no cambiar' : '••••••••'}
          />
          {errors.password && <p className={styles.fieldError}>{errors.password}</p>}
        </div>

        <div>
          <label className={styles.label} htmlFor="edit-role">Rol</label>
          <select
            className={styles.select}
            id="edit-role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value)
              validateField('role', e.target.value)
            }}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {errors.form && <p className={styles.formError}>{errors.form}</p>}

      <div className={styles.modalActions}>
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {/* Texto dinámico del botón según la acción */}
          {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear usuario'}
          {/*{loading ? 'Guardando...' : 'Guardar cambios'}*/}
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