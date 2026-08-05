import { API_URL } from '@/config/globals.ts'

// Interface para el retorno del primer paso del Login
interface LoginResponse {
  requiere2FA: boolean;
  token?: string;
  role?: string;
  tokenTemporal?: string;
  qrCode?: string | null;
}

// Interface para el retorno del segundo paso (2FA definitivo)
interface AuthResponse {
  token: string;
  role: string;
  userId: string;
}

// -------------------------------------------
// POST /auth/login -> Inicia el proceso
// -------------------------------------------
export async function login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const body = await response.json();

    if (!body.success) {
        throw new Error(body.message); // ej: "Password incorrecto", "Usuario no encontrado"
    }

    // Devolvemos la data completa (puede contener el token real O los datos de verificación 2FA)
    return body.data;
}

// -------------------------------------------
// POST /auth/verificar-2fa -> Valida el código de 6 dígitos
// -------------------------------------------
export async function verificar2FA(tokenTemporal: string, codigo: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/verificar-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos el token temporal y el código numérico ingresado por el usuario
        body: JSON.stringify({ tokenTemporal, codigo }),
    });

    const body = await response.json();

    if (!body.success) {
        throw new Error(body.message); // ej: "El código de verificación es incorrecto."
    }

    // Si la verificación fue exitosa, devolvemos { token, role } definitivos
    return body.data;
}



//##############################################
//CODIGO ANTES DE VERIFICACION DE DOBLE FACTOR
//##############################################


/*import {API_URL} from '@/config/globals.ts'|
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
}*/