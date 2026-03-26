import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

import { AppShell } from "@/components/cloudbox/app-shell"
import { DashboardPage } from "@/pages/dashboard-page"
import { DetailPage } from "@/pages/detail-page"
import { LoginPage } from "@/pages/login-page"
import { RegisterPage } from "@/pages/register-page"
import { UploadPage } from "@/pages/upload-page"
import { getPersistedAuthToken, useAuthStore } from "@/stores/auth-store"

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackRouterDevtools />
    </>
  ),
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-layout",
  beforeLoad: () => {
    const token = useAuthStore.getState().token ?? getPersistedAuthToken()
    if (!token) {
      throw redirect({ to: "/login" })
    }
  },
  component: AppShell,
})

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dashboard",
  component: DashboardPage,
})

const uploadRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/upload",
  component: UploadPage,
})

const detailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/details/$protocol",
  component: DetailPage,
})

const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    const token = useAuthStore.getState().token ?? getPersistedAuthToken()
    throw redirect({ to: token ? "/dashboard" : "/login" })
  },
})

const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  loginRoute,
  registerRoute,
  appRoute.addChildren([dashboardRoute, uploadRoute, detailRoute]),
])

export const router = createRouter({
  routeTree,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
