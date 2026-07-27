import {API_URL} from '@/config/globals.ts'
import type { User } from '@/api/types.ts'

// ------------------------------------------------------------
// GET /users → devuelve la lista de usuarios
// Es una ruta protegida: hay que mandar el token del login
// ------------------------------------------------------------

export async function getUsers(): Promise<User []> {
    // El token guardado en el login prueba quiénes somos
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_URL}/users`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })

    const body = await response.json()

    if(!body.success) {
        throw new Error(body.message) // ej: "Acceso denegado", "Token inválido"
    }

    return body.data
}