import { API_URL } from '@/config/globals'

export async function deleteUser(id: string): Promise<void> {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const body = await response.json()

  if (!body.success) {
    throw new Error(body.message || 'No se pudo eliminar el usuario')
  }
}
