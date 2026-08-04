import { API_URL } from '@/config/globals'
import type { User } from '@/api/types'

export type CreateUserData = Omit<User, '_id'>;


type ApiResponse<T> = {
  success?: boolean
  ok?: boolean
  message?: string
  tokenTemporal?: string
  token?: string
  data?: T
}

// ------------------------------------------------------------
// POST /users → crea un usuario nuevo
// Es una ruta protegida: solo un admin ya logueado puede crear usuarios
// ------------------------------------------------------------
//export async function createUser(nombre: string, apellido: string, email: string, password: string) {
export async function registerUser(data: CreateUserData): Promise<ApiResponse<User>> {
  /*const token = localStorage.getItem('token')*/
  console.log(data)
  const response = await fetch(`${API_URL}/registro/iniciar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(data),
  })

  const body = await response.json().catch(() => ({} as ApiResponse<User>))
  
  if (!response.ok || body.success === false || body.ok === false) {
    throw new Error(body.message || 'Error en el registro')
  }

  return body
}

export async function verificarCodigo(tokenTemporal: string, codigo: string): Promise<ApiResponse<User>> {
  /*const token = localStorage.getItem('token')*/
  try{
    const response = await fetch(`${API_URL}/registro/verificar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenTemporal, codigo }),
    })

    const body = await response.json().catch(() => ({} as ApiResponse<User>))

    if (!response.ok || body.success === false || body.ok === false) {
      throw new Error(body.message || 'Error al verificar el código.')
    }

    return body

  } catch (error: any) {
    console.error('Error en verificarCodigo:', error.message);
    throw error; // Lo relanzamos para que tu componente de la interfaz pueda atraparlo en un try/catch
  }
}