import { createSlice } from '@reduxjs/toolkit';

const portfolioSlice = createSlice({
    name: 'portfolio',
    initialState: {
        savedStrategies: [
            { id: '1', name: 'Iron Condor', ticker: 'SPY', netPremium: 2.45, date: '2026-04-30' },
            { id: '2', name: 'Bull Call Spread', ticker: 'AAPL', netPremium: -1.20, date: '2026-04-29' }
        ]
    },
    reducers: {
        // NEW: This allows us to push new strategies into the table
        addStrategy: (state, action) => {
            state.savedStrategies.push(action.payload);
        },
        deleteStrategy: (state, action) => {
            state.savedStrategies = state.savedStrategies.filter(s => s.id !== action.payload);
        }
    }
});

export const { addStrategy, deleteStrategy } = portfolioSlice.actions;
export default portfolioSlice.reducer;