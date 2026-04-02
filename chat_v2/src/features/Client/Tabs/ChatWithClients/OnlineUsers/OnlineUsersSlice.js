import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  agent_online: [],
  department_online: [],
  loader_list_online: false,
};

export const OnlineUsersSlice = createSlice({
  name: "onlineUserSetup",
  initialState,
  reducers: {
    changeLoaderStatusListAgents: (state) => {
      state.agent_online = [];
      state.loader_list_online = true;
    },
    updateListAgents: (state, action) => {
      state.agent_online = action.payload;
      state.loader_list_online = false;
    },
    updateListDepartments: (state, action) => {
      state.department_online = action.payload;
    },
  },
});

/* state value */
export const onlineUsersSelector = (state) => state.onlineUserSetup;

/* export command function */
export const {
  updateListAgents,
  changeLoaderStatusListAgents,
  updateListDepartments,
} = OnlineUsersSlice.actions;

/* exporting all reduxer */
export default OnlineUsersSlice.reducer;
