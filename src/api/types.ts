// Los campos del usuario que usamos en la app
export interface User {
  _id: string // MongoDB usa _id, no id
  nombre: string
  apellido: string
  email: string
  password: string
  fechaNacimiento: string
  edad: number
  genero: string
  telefono: string
  direccion: string
  localidad: string
  provincia: string
  pais: string
  codigoPostal: string
  role: string
}

export function normalizeUser(user: Record<string, any> | null | undefined): User | null {
  if (!user) return null

  const userId = user._id ?? user.id
  if (!userId) return null

  return {
    ...user,
    _id: String(userId),
  } as User
}