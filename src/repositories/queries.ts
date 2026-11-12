import { useQuery } from "@tanstack/react-query";
import { SEED_CATEGORIES, SEED_MENU, SEED_SETTINGS } from "@/data/seed";
import { menuRepo, settingsRepo } from "./index";

// initialDataUpdatedAt: 0 renders seed on the server, then refetches on mount so
// browser-stored demo edits appear without a hydration mismatch.
export const useMenuItems = () =>
  useQuery({ queryKey: ["menu-items"], queryFn: () => menuRepo.listMenuItems(), initialData: SEED_MENU, initialDataUpdatedAt: 0 });
export const useCategories = (includeInactive = false) =>
  useQuery({
    queryKey: ["categories", includeInactive],
    queryFn: () => menuRepo.listCategories({ includeInactive }),
    initialData: SEED_CATEGORIES.filter((c) => includeInactive || c.isActive),
    initialDataUpdatedAt: 0,
  });
export const useSettings = () =>
  useQuery({ queryKey: ["settings"], queryFn: () => settingsRepo.getSettings(), initialData: SEED_SETTINGS, initialDataUpdatedAt: 0 });
