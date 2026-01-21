
export type Category = 
  | "FRUITS_AND_VEGETABLES"
  | "DAIRY_AND_EGGS"
  | "RICE_ATTA_AND_GRAINS"
  | "SNACKS_AND_BISCUITS"
  | "SPICES_AND_MASALAS"
  | "BEVERAGES_AND_DRINKS"
  | "PERSONAL_CARE"
  | "HOUSEHOLD_ESSENTIALS"
  | "INSTANT_AND_PACKAGED_FOOD"
  | "BABY_AND_PET_CARE";

export type Unit = "KG" | "G" | "L" | "ML" | "PIECE" | "PACK" | "DOZEN" | "BOX";

export interface GroceryItem {
  name: string;
  id: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
  price: string;
  unit: Unit;
}

export interface CartType {
  name: string;
  id: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  price: string;
  unit: Unit;
  quantity: number
}