import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
  id: string; // This will be the ID from MongoDB (composite of user/product or the wish item itself)
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload;
    },
    addToWishlistLocal(state, action: PayloadAction<WishlistItem>) {
      const newItem = action.payload;
      const exists = state.items.find((item) => item.productId === newItem.productId);
      if (!exists) {
        state.items.push(newItem);
      }
    },
    removeFromWishlistLocal(state, action: PayloadAction<string>) {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.productId !== productId);
    },
    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const { setWishlist, addToWishlistLocal, removeFromWishlistLocal, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
