const API_BASE_URL = 'https://quant-1-a9oy.onrender.com/api';

export const fetchModelPredictions = async (marketData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/predict-greeks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(marketData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch Neural Net predictions:", error);
        throw error;
    }
};