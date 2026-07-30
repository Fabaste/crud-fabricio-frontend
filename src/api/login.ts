import {API_URL} from '@/config/globals.ts'
// -------------------------------------------
//POST /auth/login -> devuelve {token, role}
//--------------------------------------------
export async function login(email: string, password: string){
    // 1. Hacemos la peticion POST con email y password en el body
    console.log(JSON.stringify({email, password}))
    const response = await fetch(`${API_URL}/auth/login`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
    })
//console.log(response.json())
    // 2. Convertimos la respuesta a JSON()
    const body = await response.json()
    //console.log(body)
    // 3. Si el backend respondio con error, lanzamos su mensaje
    if (!body.success){
        throw new Error(body.message) // ej: "Password incorrecto"
    }

    // 4. Devolvemos solo la data: { token, role}
    return body.data
}