/* eslint-disable */

// @ts-nocheck
// This file is normally refreshed by the TanStack Router Vite plugin.

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as MenuRouteImport } from './routes/menu'
import { Route as AboutRouteImport } from './routes/about'
import { Route as ContactRouteImport } from './routes/contact'
import { Route as TermsRouteImport } from './routes/terms'
import { Route as PrivacyRouteImport } from './routes/privacy'
import { Route as RefundPolicyRouteImport } from './routes/refund-policy'
import { Route as CartRouteImport } from './routes/cart'
import { Route as CheckoutRouteImport } from './routes/checkout'
import { Route as OrderOrderIdRouteImport } from './routes/order.$orderId'
import { Route as AdminRouteImport } from './routes/admin'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const MenuRoute = MenuRouteImport.update({ id: '/menu', path: '/menu', getParentRoute: () => rootRouteImport } as any)
const AboutRoute = AboutRouteImport.update({ id: '/about', path: '/about', getParentRoute: () => rootRouteImport } as any)
const ContactRoute = ContactRouteImport.update({ id: '/contact', path: '/contact', getParentRoute: () => rootRouteImport } as any)
const TermsRoute = TermsRouteImport.update({ id: '/terms', path: '/terms', getParentRoute: () => rootRouteImport } as any)
const PrivacyRoute = PrivacyRouteImport.update({ id: '/privacy', path: '/privacy', getParentRoute: () => rootRouteImport } as any)
const RefundPolicyRoute = RefundPolicyRouteImport.update({ id: '/refund-policy', path: '/refund-policy', getParentRoute: () => rootRouteImport } as any)
const CartRoute = CartRouteImport.update({ id: '/cart', path: '/cart', getParentRoute: () => rootRouteImport } as any)
const CheckoutRoute = CheckoutRouteImport.update({ id: '/checkout', path: '/checkout', getParentRoute: () => rootRouteImport } as any)
const OrderOrderIdRoute = OrderOrderIdRouteImport.update({ id: '/order/$orderId', path: '/order/$orderId', getParentRoute: () => rootRouteImport } as any)
const AdminRoute = AdminRouteImport.update({ id: '/admin', path: '/admin', getParentRoute: () => rootRouteImport } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/menu': typeof MenuRoute
  '/about': typeof AboutRoute
  '/contact': typeof ContactRoute
  '/terms': typeof TermsRoute
  '/privacy': typeof PrivacyRoute
  '/refund-policy': typeof RefundPolicyRoute
  '/cart': typeof CartRoute
  '/checkout': typeof CheckoutRoute
  '/order/$orderId': typeof OrderOrderIdRoute
  '/admin': typeof AdminRoute
}
export interface FileRoutesByTo extends FileRoutesByFullPath {}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/menu': typeof MenuRoute
  '/about': typeof AboutRoute
  '/contact': typeof ContactRoute
  '/terms': typeof TermsRoute
  '/privacy': typeof PrivacyRoute
  '/refund-policy': typeof RefundPolicyRoute
  '/cart': typeof CartRoute
  '/checkout': typeof CheckoutRoute
  '/order/$orderId': typeof OrderOrderIdRoute
  '/admin': typeof AdminRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/menu' | '/about' | '/contact' | '/terms' | '/privacy' | '/refund-policy' | '/cart' | '/checkout' | '/order/$orderId' | '/admin'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/menu' | '/about' | '/contact' | '/terms' | '/privacy' | '/refund-policy' | '/cart' | '/checkout' | '/order/$orderId' | '/admin'
  id: '__root__' | '/' | '/menu' | '/about' | '/contact' | '/terms' | '/privacy' | '/refund-policy' | '/cart' | '/checkout' | '/order/$orderId' | '/admin'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  MenuRoute: typeof MenuRoute
  AboutRoute: typeof AboutRoute
  ContactRoute: typeof ContactRoute
  TermsRoute: typeof TermsRoute
  PrivacyRoute: typeof PrivacyRoute
  RefundPolicyRoute: typeof RefundPolicyRoute
  CartRoute: typeof CartRoute
  CheckoutRoute: typeof CheckoutRoute
  OrderOrderIdRoute: typeof OrderOrderIdRoute
  AdminRoute: typeof AdminRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/menu': { id: '/menu'; path: '/menu'; fullPath: '/menu'; preLoaderRoute: typeof MenuRouteImport; parentRoute: typeof rootRouteImport }
    '/about': { id: '/about'; path: '/about'; fullPath: '/about'; preLoaderRoute: typeof AboutRouteImport; parentRoute: typeof rootRouteImport }
    '/contact': { id: '/contact'; path: '/contact'; fullPath: '/contact'; preLoaderRoute: typeof ContactRouteImport; parentRoute: typeof rootRouteImport }
    '/terms': { id: '/terms'; path: '/terms'; fullPath: '/terms'; preLoaderRoute: typeof TermsRouteImport; parentRoute: typeof rootRouteImport }
    '/privacy': { id: '/privacy'; path: '/privacy'; fullPath: '/privacy'; preLoaderRoute: typeof PrivacyRouteImport; parentRoute: typeof rootRouteImport }
    '/refund-policy': { id: '/refund-policy'; path: '/refund-policy'; fullPath: '/refund-policy'; preLoaderRoute: typeof RefundPolicyRouteImport; parentRoute: typeof rootRouteImport }
    '/cart': { id: '/cart'; path: '/cart'; fullPath: '/cart'; preLoaderRoute: typeof CartRouteImport; parentRoute: typeof rootRouteImport }
    '/checkout': { id: '/checkout'; path: '/checkout'; fullPath: '/checkout'; preLoaderRoute: typeof CheckoutRouteImport; parentRoute: typeof rootRouteImport }
    '/order/$orderId': { id: '/order/$orderId'; path: '/order/$orderId'; fullPath: '/order/$orderId'; preLoaderRoute: typeof OrderOrderIdRouteImport; parentRoute: typeof rootRouteImport }
    '/admin': { id: '/admin'; path: '/admin'; fullPath: '/admin'; preLoaderRoute: typeof AdminRouteImport; parentRoute: typeof rootRouteImport }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute,
  MenuRoute,
  AboutRoute,
  ContactRoute,
  TermsRoute,
  PrivacyRoute,
  RefundPolicyRoute,
  CartRoute,
  CheckoutRoute,
  OrderOrderIdRoute,
  AdminRoute,
}
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
