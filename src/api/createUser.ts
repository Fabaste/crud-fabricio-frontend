import { API_URL } from '@/config/globals'
import { normalizeUser, type User } from '@/api/types'

export type CreateUserData = Omit<User, '_id'>;

// ------------------------------------------------------------
// POST /users → crea un usuario nuevo
// Es una ruta protegida: solo un admin ya logueado puede crear usuarios
// ------------------------------------------------------------
export async function createUser(dataOrName: CreateUserData | string, apellido?: string, email?: string, password?: string): Promise<User> {
  const token = localStorage.getItem('token')

  const payload = typeof dataOrName === 'string'
    ? {
        nombre: dataOrName,
        apellido: apellido ?? '',
        email: email ?? '',
        password: password ?? '',
      }
    : dataOrName

  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const body = await response.json().catch(() => ({}))

  if (!body.success) {
    throw new Error(body.message || 'No se pudo crear el usuario')
  }

  const normalizedUser = normalizeUser(body.data)
  if (!normalizedUser) {
    throw new Error('La respuesta del servidor no devolvió un usuario válido')
  }

  return normalizedUser
}