import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getLabels } from './LabelAPI';

const initialState = {
  listLabels: [],
  modalLabel: false,
};

export const getDataLabels = createAsyncThunk(
  'labelSetup/getDataLabels',
  async (token) => {
    const response = await getLabels(token);
    return response;
  }
);

export const LabelSlice = createSlice({
  name: 'labelSetup',
  initialState,
  reducers: {
    updateModalLabel: (state, action) => {
      state.modalLabel = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDataLabels.pending, (state) => {})
      .addCase(getDataLabels.fulfilled, (state, action) => {
        const resData = action.payload;
        state.listLabels = resData.data.data;
      });
  },
});

export const labelSelector = (state) => state.labelSetup;

export const { updateModalLabel } = LabelSlice.actions;

export default LabelSlice.reducer;
