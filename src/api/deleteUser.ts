import { API_URL } from '@/config/globals'
import type { User } from '@/api/types'

// El email no se puede modificar: el backend rechaza el request si viene en el body
//export type DeleteUserPayload = Partial<Omit<User, '_id' | 'email'>>

// ------------------------------------------------------------
// PUT /users/:id → actualiza un usuario existente
// Es una ruta protegida: solo un admin ya logueado puede editar usuarios
// ------------------------------------------------------------
export async function deleteUser(id: string) {//: Promise<User> {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    //body: JSON.stringify(data),
  })

  const body = await response.json()

  if (!body.success) {
    throw new Error(body.message) // ej: "Usuario no encontrado"
  }

  // El backend devuelve el usuario actualizado con "id" en vez de "_id"
  //const { id: userId, ...rest } = body.data
  return ( body.message )
}