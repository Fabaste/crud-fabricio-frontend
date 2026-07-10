import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'

import Home from '@/pages/Home/Home'
import Login from '@/pages/Login/Login'
import Register from '@/pages/Register/Register'

const rootRoute = createRootRoute({
  component: Outlet,
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

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}