import { API_URL } from '@/config/globals'
import type { User } from '@/api/types'

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

  const body = await response.json()

  if (!body.success) {
    throw new Error(body.message) // ej: "El email no puede modificarse", "Usuario no encontrado"
  }

  // El backend devuelve el usuario actualizado con "id" en vez de "_id"
  const { id: userId, ...rest } = body.data
  return { _id: userId, ...rest }
}