import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoading: boolean;
  isCartModalOpen: boolean;
  isSidebarOpen: boolean;
  activeModal: string | null;
}

const initialState: UIState = {
  isLoading: false,
  isCartModalOpen: false,
  isSidebarOpen: false,
  activeModal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    toggleCartModal(state) {
      state.isCartModalOpen = !state.isCartModalOpen;
    },
    setCartModalOpen(state, action: PayloadAction<boolean>) {
      state.isCartModalOpen = action.payload;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
    setActiveModal(state, action: PayloadAction<string | null>) {
      state.activeModal = action.payload;
    }
  },
});

export const { setLoading, toggleCartModal, setCartModalOpen, setSidebarOpen, setActiveModal } = uiSlice.actions;
export default uiSlice.reducer;
