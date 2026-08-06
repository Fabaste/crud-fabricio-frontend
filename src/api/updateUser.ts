import { API_URL } from '@/config/globals'
import { normalizeUser, type User } from '@/api/types'

// El email no se puede modificar: el backend rechaza el request si viene en el body
export type UpdateUserPayload = Partial<Omit<User, '_id' | 'email'>>

// ------------------------------------------------------------
// PUT /users/:id → actualiza un usuario existente
// Es una ruta protegida: solo un admin ya logueado puede editar usuarios
// ------------------------------------------------------------
export async function updateUser(id: string, data: UpdateUserPayload): Promise<User> {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const body = await response.json().catch(() => ({}))

  if (!body.success) {
    throw new Error(body.message || 'No se pudo actualizar el usuario')
  }

  const normalizedUser = normalizeUser(body.data)
  if (!normalizedUser) {
    throw new Error('La respuesta del servidor no devolvió un usuario válido')
  }

  return normalizedUser
}