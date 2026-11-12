/** Single switch point between demo and real backend implementations. */
import {
  demoAdminAuthRepository, demoMenuRepository, demoOrderRepository, demoSettingsRepository,
} from "./demo";

export const IS_DEMO_MODE = true;
export const menuRepo = demoMenuRepository;
export const settingsRepo = demoSettingsRepository;
export const orderRepo = demoOrderRepository;
export const adminAuth = demoAdminAuthRepository;
