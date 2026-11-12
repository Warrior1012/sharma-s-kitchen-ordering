import type { Category, MenuItem, StoreSettings } from "@/domain/types";

/** DEMO SEED DATA. Sample dishes and prices, not a real menu. */
export const SEED_SETTINGS: StoreSettings = {
  name: "Sharma's Kitchen",
  cuisine: "North Indian",
  timezone: "Asia/Kolkata",
  openingHours: ([2, 3, 4, 5, 6, 0] as const).map((day) => ({ day, open: "11:00", close: "23:00" })),
  deliveryRadiusKm: 5,
  deliveryFeePaise: 3000,
  minimumOrderPaise: 15000,
  acceptingOrders: true,
  phone: null,
  email: null,
  address: null,
  fssaiLicense: null,
  upiId: null,
  upiPayeeName: null,
  socialLinks: [],
  whatsapp: null,
  upiQrDataUrl: null,
};

export const SEED_CATEGORIES: Category[] = [
  { id: "cat-starters", slug: "starters", name: "Starters", description: "From the tandoor and the tawa", sortOrder: 1, isActive: true },
  { id: "cat-mains", slug: "mains", name: "Mains", description: "Slow cooked curries and dals", sortOrder: 2, isActive: true },
  { id: "cat-rice", slug: "biryani-rice", name: "Biryani and Rice", description: null, sortOrder: 3, isActive: true },
  { id: "cat-breads", slug: "breads", name: "Breads", description: null, sortOrder: 4, isActive: true },
  { id: "cat-desserts", slug: "desserts", name: "Desserts", description: null, sortOrder: 5, isActive: true },
  { id: "cat-drinks", slug: "beverages", name: "Beverages", description: null, sortOrder: 6, isActive: true },
];

const i = (
  id: string, categoryId: string, name: string, description: string, rupees: number,
  isVeg: boolean, sortOrder: number, imageKey: MenuItem["imageKey"] = null, isAvailable = true, isPopular = false,
): MenuItem => ({ id, categoryId, name, description, pricePaise: rupees * 100, isVeg, isAvailable, imageKey, sortOrder, isPopular });

export const SEED_MENU: MenuItem[] = [
  i("itm-paneer-tikka", "cat-starters", "Paneer Tikka", "Cottage cheese, peppers and onion marinated in hung curd and spices, charred in the tandoor.", 260, true, 1, "paneer-tikka", true, true),
  i("itm-hara-kebab", "cat-starters", "Hara Bhara Kebab", "Spinach, peas and potato patties with mint chutney.", 210, true, 2),
  i("itm-chicken-tikka", "cat-starters", "Chicken Tikka", "Boneless chicken in a smoky yoghurt marinade.", 320, false, 3),
  i("itm-seekh", "cat-starters", "Mutton Seekh Kebab", "Minced mutton skewers with ginger and green chilli.", 380, false, 4, null, false),
  i("itm-dal-makhani", "cat-mains", "Dal Makhani", "Black lentils simmered overnight with butter and cream.", 240, true, 1, "dal-makhani", true, true),
  i("itm-paneer-butter", "cat-mains", "Paneer Butter Masala", "Paneer in a mild tomato and cashew gravy.", 280, true, 2),
  i("itm-chole", "cat-mains", "Amritsari Chole", "Chickpeas in a dark, tangy spice blend.", 200, true, 3),
  i("itm-butter-chicken", "cat-mains", "Butter Chicken", "Tandoori chicken in a velvety tomato makhani gravy.", 360, false, 4, null, true, true),
  i("itm-rogan-josh", "cat-mains", "Mutton Rogan Josh", "Kashmiri style mutton curry with whole spices.", 420, false, 5),
  i("itm-veg-biryani", "cat-rice", "Veg Dum Biryani", "Seasonal vegetables and basmati sealed and slow cooked.", 260, true, 1, null, true, true),
  i("itm-chicken-biryani", "cat-rice", "Chicken Dum Biryani", "Basmati layered with spiced chicken, saffron and fried onion.", 340, false, 2, "biryani", true, true),
  i("itm-jeera-rice", "cat-rice", "Jeera Rice", "Basmati tempered with cumin and ghee.", 150, true, 3),
  i("itm-butter-naan", "cat-breads", "Butter Naan", "Leavened bread from the tandoor, brushed with butter.", 60, true, 1),
  i("itm-garlic-naan", "cat-breads", "Garlic Naan", "Naan topped with garlic and coriander.", 75, true, 2),
  i("itm-laccha", "cat-breads", "Laccha Paratha", "Flaky layered whole wheat paratha.", 70, true, 3),
  i("itm-gulab-jamun", "cat-desserts", "Gulab Jamun", "Two warm milk dumplings in cardamom syrup.", 120, true, 1),
  i("itm-phirni", "cat-desserts", "Kesar Phirni", "Ground rice pudding with saffron and pistachio.", 140, true, 2),
  i("itm-lassi", "cat-drinks", "Sweet Lassi", "Thick churned yoghurt, lightly sweetened.", 110, true, 1),
  i("itm-chaas", "cat-drinks", "Masala Chaas", "Spiced buttermilk with roasted cumin.", 80, true, 2),
];
