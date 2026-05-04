// src/store/marketDataSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchModelPredictions } from '../api/quantClient';

// This is your Thunk: It handles the async API call gracefully
export const getPredictions = createAsyncThunk(
    'marketData/getPredictions',
    async (marketParams, { rejectWithValue }) => {
        try {
            const data = await fetchModelPredictions(marketParams);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    searchQuery: "SPY",
    currentUnderlyingPrice: 502.45,
    neuralNetResults: { price: 0, delta: 0, gamma: 0 },
    isLoading: false,
    error: null,
};

const marketDataSlice = createSlice({
    name: 'marketData',
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        updateUnderlyingPrice: (state, action) => {
            state.currentUnderlyingPrice = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPredictions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getPredictions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.neuralNetResults = action.payload;
            })
            .addCase(getPredictions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { setSearchQuery, updateUnderlyingPrice } = marketDataSlice.actions;
export default marketDataSlice.reducer;