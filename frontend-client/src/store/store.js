
import { configureStore } from '@reduxjs/toolkit';
import marketDataReducer from './marketDataSlice';
import portfolioReducer from './portfolioSlice';

export const store = configureStore({
    reducer: {
        marketData: marketDataReducer,
        portfolio: portfolioReducer,
    },

    devTools: process.env.NODE_ENV !== 'production',
});