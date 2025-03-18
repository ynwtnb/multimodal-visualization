import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./dataReducer";

const store = configureStore({
    reducer: {
        dataReducer,
    },
});

export default store;