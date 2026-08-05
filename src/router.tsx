import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'

import Home from '@/pages/Home/Home'
import Login from '@/pages/Login/Login'
import Register from '@/pages/Register/Register'
import CreateUser from '@/pages/CreateUser/CreateUser'
import { Toaster } from 'react-hot-toast'

const rootRoute = createRootRoute({
  //component: Outlet,

  component: () => (
    <>
      <Outlet />
      {/* Contenedor global de notificaciones */}
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#f5e2ba',
            color: '#000000',
          },
        }}
      />
    </>
  ),
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
})

const createUserRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/createUser',
  component: CreateUser,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
  createUserRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}