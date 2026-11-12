import { useQuery } from "@tanstack/react-query";
import { SEED_CATEGORIES, SEED_MENU, SEED_SETTINGS } from "@/data/seed";
import { menuRepo, orderRepo, settingsRepo } from "./index";

export const useMenuItems = () =>
  useQuery({ queryKey: ["menu-items"], queryFn: () => menuRepo.listMenuItems(), initialData: SEED_MENU, initialDataUpdatedAt: 0 });

export const useCategories = (includeInactive = false) =>
  useQuery({
    queryKey: ["categories", includeInactive],
    queryFn: () => menuRepo.listCategories({ includeInactive }),
    initialData: SEED_CATEGORIES.filter((category) => includeInactive || category.isActive),
    initialDataUpdatedAt: 0,
  });

export const useSettings = () =>
  useQuery({ queryKey: ["settings"], queryFn: () => settingsRepo.getSettings(), initialData: SEED_SETTINGS, initialDataUpdatedAt: 0 });

export const useOrders = (pollMs = 8000) =>
  useQuery({ queryKey: ["orders"], queryFn: () => orderRepo.listOrders(), refetchInterval: pollMs, refetchOnWindowFocus: true });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: () => orderRepo.getOrder(id),
    enabled: Boolean(id),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
