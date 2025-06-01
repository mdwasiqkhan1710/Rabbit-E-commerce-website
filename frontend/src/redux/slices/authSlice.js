import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const cleanToken = (token) => {
  return token ? token.replace(/^"|"$/g, '') : null;
};

//Retrieve user info and Token from local storage if available
const userFormStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

//Check for existing Guest Id in local storage or generate new one
const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

//Initial State
const initialState = {
  user: userFormStorage,
  guestId: initialGuestId,
  loading: false,
  error: null,
};

//Async Thumk for user login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
        userData
      );
      console.log("Login response:", response.data);
       if (response.data.token) {
        const cleanedToken = cleanToken(response.data.token);
        localStorage.setItem("userToken", cleanedToken);
      }
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      if (response.data.token) {
        localStorage.setItem("userToken", cleanedToken);
      } else {
        throw new Error("Token missing in login response");
      }

      return response.data.user; //Return the user object from the response
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

//User Registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        userData
      );
      console.log("Register response:", response.data);
       if (response.data.token) {
        const cleanedToken = cleanToken(response.data.token);
        localStorage.setItem("userToken", cleanedToken);
      }
      if (response.data.token) {
        localStorage.setItem("userToken", cleanedToken);
        return response.data.user;
      } else {
        throw new Error("Token missing in registration response");
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

//Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.guestId = `guest_${new Date().getTime()}`; //Reset the guest id on logout
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.setItem("guestId", state.guestId); //Set new guest id in local storage
    },
    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },
  },
  extraReducers: (builder) => {
    builder
        .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
        })
        .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        // state.error = action.payload.message;
        })
        .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
        })
        .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        })
  },
});


export const {logout, generateNewGuestId} = authSlice.actions;
export default authSlice.reducer;