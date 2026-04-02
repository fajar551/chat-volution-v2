import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDepartments, getSocialMedia, getTopics } from './SelectAPI';

const initialState = {
  topicList: [
    { id: 1, name: 'General Inquiry' },
    { id: 2, name: 'Technical Support' },
    { id: 3, name: 'Billing' }
  ],
  departmentList: [
    { id: 1, name: 'Customer Service' },
    { id: 2, name: 'Technical' },
    { id: 3, name: 'Sales' }
  ],
  socialMediaList: [],
  OnloadImage: [],
  originCountImgData: [],
  newMessage: false,
};

/* get topics */
export const getListTopics = createAsyncThunk(
  'selectSetup/getListTopics',
  async (apiKey) => {
    const response = await getTopics(apiKey);
    return response;
  }
);

/* get departments */
export const getListDepartments = createAsyncThunk(
  'selectSetup/getListDepartments',
  async (apiKey) => {
    const response = await getDepartments(apiKey);
    return response;
  }
);

/* get social media list */
export const getSocialMediaList = createAsyncThunk(
  'selectSetup/getSocialMediaList',
  async (apiKey) => {
    const response = await getSocialMedia(apiKey);
    return response;
  }
);

export const SelectSlice = createSlice({
  name: 'selectSetup',
  initialState,
  reducers: {
    clearListTopic: (state) => {
      state.topicList = [];
    },
    clearDepartmentList: (state) => {
      state.departmentList = [];
    },
    setTopicList: (state, action) => {
      state.topicList = action.payload;
    },
    setDepartmentList: (state, action) => {
      state.departmentList = action.payload;
    },
    setSocialMediaList: (state, action) => {
      state.socialMediaList = action.payload;
    },
    updateOnloadImage: (state, action) => {
      state.OnloadImage.push(action.payload);
    },
    clearOnloadImage: (state) => {
      state.OnloadImage = [];
    },
    updateOriginImage: (state, action) => {
      state.originCountImgData = action.payload;
    },
    clearOriginImage: (state) => {
      state.originCountImgData = [];
    },
    updateNewMessage: (state, action) => {
      state.newMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getListTopics.fulfilled, (state, action) => {
        const resData = action.payload.data.data;
        state.topicList = resData;
      })
      .addCase(getListTopics.rejected, (state) => {
        state.topicList = [];
      })
      .addCase(getListDepartments.fulfilled, (state, action) => {
        const resData = action.payload.data.data;
        state.departmentList = resData;
      })
      .addCase(getListDepartments.rejected, (state) => {
        state.departmentList = [];
      })
      .addCase(getSocialMediaList.fulfilled, (state, action) => {
        const resData = action.payload.data.data;
        state.socialMediaList = resData;
      })
      .addCase(getSocialMediaList.rejected, (state) => {
        state.socialMediaList = [];
      });
  },
});

export const selectSelector = (state) => state.selectSetup;
export const {
  clearDepartmentList,
  clearListTopic,
  setTopicList,
  setDepartmentList,
  setSocialMediaList,
  updateOnloadImage,
  clearOnloadImage,
  updateOriginImage,
  clearOriginImage,
  updateNewMessage,
} = SelectSlice.actions;
export default SelectSlice.reducer;
