import pandas as pd
import numpy as np
from scipy.stats import norm
import os

def calculate_smile_volatility(S, K, T, base_vol=0.15):
    """
    Simulates the Volatility Surface:
    - Crash premium (Smile) for out-of-the-money puts.
    - Term structure (Volatility usually increases with Time to Maturity).
    """
    moneyness = K / S
    
    # 1. The Volatility Skew (Smile)
    vol_skew = 0.3 * (moneyness - 1.0)**2
    crash_premium = np.where(moneyness < 1.0, 0.15 * (1.0 - moneyness), 0.0)
    
    # 2. The Term Structure (Longer time = more uncertainty = higher base vol)
    term_premium = 0.05 * np.sqrt(T)
    
    return base_vol + vol_skew + crash_premium + term_premium

def bs_call_price(S, K, T, r, sigma):
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)

def generate_massive_market_data(filename="data/raw/spx_market_chain.csv"):
    print("[*] Generating 10,000-Row Volatility Surface...")
    
    # Fixed parameters
    r = 0.04    
    
    # Create multi-dimensional market scenarios
    stock_prices = np.linspace(3000, 5000, 10)  # 10 different market regimes
    maturities = np.linspace(0.1, 2.0, 10)      # 10 different expiration dates (1 month to 2 years)
    
    data = []
    
    for S in stock_prices:
        for T in maturities:
            # Generate 100 strikes centered around the current stock price
            strikes = np.linspace(S * 0.5, S * 1.5, 100) 
            
            for K in strikes:
                market_vol = calculate_smile_volatility(S, K, T)
                market_price = bs_call_price(S, K, T, r, market_vol)
                
                data.append({
                    "Underlying": S,
                    "Strike": K,
                    "Time_to_Maturity": T,
                    "Risk_Free_Rate": r,
                    "Implied_Volatility": market_vol, # The "real" feared vol
                    "Market_Call_Price": market_price
                })
        
    df = pd.DataFrame(data)
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    df.to_csv(filename, index=False)
    
    print(f"[*] Success! {len(df)} rows saved to {filename}")

if __name__ == "__main__":
    generate_massive_market_data()