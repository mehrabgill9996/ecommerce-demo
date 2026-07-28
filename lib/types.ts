export type Product = {
  id: string;
  name: string;
  description: string;
  /** Price in cents, CAD */
  price: number;
  image: string;
};

export type CartItem = {
  id: string;
  quantity: number;
};
