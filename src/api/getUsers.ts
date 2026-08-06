import {API_URL} from '@/config/globals.ts'
import { normalizeUser, type User } from '@/api/types.ts'

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
    const body = await response.json().catch(() => ({}))

    if(!body.success) {
        throw new Error(body.message || 'No se pudo obtener la lista de usuarios') // ej: "Acceso denegado", "Token inválido"
    }

    const rawUsers = Array.isArray(body.data) ? body.data : body.data ? [body.data] : []
    return rawUsers.map((user: Record<string, any>) => normalizeUser(user)).filter((user: User | null | undefined): user is User => Boolean(user))
}