import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: [],
}

const dataSlice = createSlice({
    name: "data",
    initialState,
    reducers: {
        setData: (state, { payload: data }) => {
            state.data = data as any;
            console.log("Data added: ", state.data);
        },
    },
});

export const { setData } = dataSlice.actions;
export default dataSlice.reducer;