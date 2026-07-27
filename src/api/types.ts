// Los campos del usuario que usamos en la app
export interface User {
  _id: string // MongoDB usa _id, no id
  nombre: string
  apellido: string
  email: string
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