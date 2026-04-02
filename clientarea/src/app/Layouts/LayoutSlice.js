import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  /* please read on file readme.md, to explanation key initialState */
  feature: 'not_opened',
  featureBefore: 'not_opened',
  bodyMaxH: '400px',
  bodyMinH: '400px',
  deviceVersion: 'large_desktop',
  volumeAlert: 0,
  runAlert: false,
};

export const LayoutSlice = createSlice({
  name: 'layoutSetup',
  initialState,
  reducers: {
    updateFeatureActive: (state, action) => {
      state.feature = action.payload;
    },
    updateFeatureBefore: (state, action) => {
      state.featureBefore = action.payload;
    },
    updateHeightBody: (state, action) => {
      state.bodyMaxH = action.payload.maxHeight;
      state.bodyMinH = action.payload.minHeight;
    },
    updateDeviceVersion: (state, action) => {
      state.deviceVersion = action.payload;
    },
    changeVolumeAlert: (state, action) => {
      state.volumeAlert = action.payload;
    },
    changeStatusAlertRunned: (state, action) => {
      state.runAlert = action.payload;
    },
  },
});

export const layoutSetupSelector = (state) => state.layoutSetup;

export const {
  updateFeatureActive,
  updateFeatureBefore,
  updateHeightBody,
  updateDeviceVersion,
  changeVolumeAlert,
  changeStatusAlertRunned,
} = LayoutSlice.actions;

export default LayoutSlice.reducer;
