import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

//Fetch all users
// export const fetchUsers = createAsyncThunk("admin/fetchUsers", async() => {
//         const response = await axios.get(
//             `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, 
//             {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem("userToken")}`
//                 }
//             },
//         );
//         return response.data;
// });

export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (_, { rejectWithValue }) => {
    try {
        // Clean token - remove quotes if present
        const token = localStorage.getItem("userToken");
        
        const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, 
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        // Log detailed error
        console.error("Fetch users error:", error.response?.data);
        return rejectWithValue(error.response?.data || error.message);
    }
});

//Create user 
export const addUser = createAsyncThunk("admin/addUser", async(userData, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, 
            userData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                }
            },
    );
    return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

//Update User Info
export const updateUser = createAsyncThunk("admin/updateUser", async({id, name, email, role}) => {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`, 
            {id, name, email, role},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                }
            },
    );
    return response.data.user;
});

//Delete User
export const deleteUser = createAsyncThunk("admin/deleteUser", async(id) => {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                }
            },
    );
    return id;
});

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        users:[],
        loading:false,
        error:null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            //Fetch all Users
            .addCase(fetchUsers.pending, (state) => {
                state.loading=true;
            })
            .addCase(fetchUsers.fulfilled, (state,action) => {
                state.loading=false;
                state.users=action.payload;
            })
            .addCase(fetchUsers.rejected, (state,action) => {
                state.loading=false;
                state.error=action.payload?.message || "Failed to load users";
            })
            //update user
            .addCase(updateUser.fulfilled, (state, action) => {
                const updatedUser = action.payload;
                const userIndex = state.users.findIndex((user) => user._id === updatedUser._id);
                if(userIndex !== -1) {
                    state.users[userIndex]=updatedUser;
                }
            })
            //delete user
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter((user) => user._id !== action.payload);
            })
            //Add user
            .addCase(addUser.pending, (state) => {
                state.loading=true;
                state.error=null;
            })
            .addCase(addUser.fulfilled, (state, action) => {
                state.loading=false;
                state.users.push(action.payload.user) //add new user to the state
            })
            .addCase(addUser.rejected, (state,action) => {
                state.loading=false;
                state.error=action.payload.message;
            })
    }
});

export default adminSlice.reducer;