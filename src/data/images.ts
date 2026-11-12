import biryani from "@/assets/dish-biryani.webp";
import paneerTikka from "@/assets/dish-paneer-tikka.webp";
import dalMakhani from "@/assets/dish-dal-makhani.webp";
import thali from "@/assets/hero-thali.webp";
import type { ImageKey } from "@/domain/types";

/** Replaceable demo imagery (AI generated placeholders, not photos of the actual restaurant's food). */
export const DISH_IMAGES: Record<ImageKey, { src: string; alt: string }> = {
  biryani: { src: biryani, alt: "Demo image: chicken biryani in a copper handi" },
  "paneer-tikka": { src: paneerTikka, alt: "Demo image: paneer tikka skewers with mint chutney" },
  "dal-makhani": { src: dalMakhani, alt: "Demo image: dal makhani in a brass bowl with naan" },
  thali: { src: thali, alt: "Demo image: North Indian thali with dal, paneer, rice and naan" },
};
