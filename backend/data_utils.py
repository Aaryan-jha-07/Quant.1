import torch
from torch.distributions import Normal
from torch.utils.data import TensorDataset, DataLoader

import pandas as pd

def black_scholes_call(S, K, T, r, sigma):
    """
    Calculates the exact Black-Scholes European Call option price.
    All inputs should be PyTorch tensors.
    """
    normal = Normal(torch.tensor([0.0]), torch.tensor([1.0]))

    d1 = (torch.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * torch.sqrt(T))
    d2 = d1 - sigma * torch.sqrt(T)

    call_price = S * normal.cdf(d1) - K * torch.exp(-r * T) * normal.cdf(d2)
    
    return call_price

def generate_training_universe(num_samples=100_000):
    """
    Generates a randomized dataset of market parameters and their true BS prices.
    """
    # 1. Sample parameters uniformly
    S = torch.empty(num_samples).uniform_(50.0, 150.0)     # Stock price: $50 to $150
    K = torch.empty(num_samples).uniform_(50.0, 150.0)     # Strike price: $50 to $150
    T = torch.empty(num_samples).uniform_(0.1, 3.0)        # Time to maturity: 0.1 to 3 years
    r = torch.empty(num_samples).uniform_(0.01, 0.05)      # Risk-free rate: 1% to 5%
    sigma = torch.empty(num_samples).uniform_(0.05, 0.50)  # Volatility: 5% to 50%
    
    # 2. Calculate ground truth targets
    targets = black_scholes_call(S, K, T, r, sigma)
    
    # 3. Stack features into a single matrix of shape (num_samples, 5)
    features = torch.stack([S, K, T, r, sigma], dim=1)
    
    return features, targets

def preprocess_to_moneyness(features):
    """
    Converts raw (S, K, T, r, sigma) into engineered features (S/K, T, r, sigma).
    """
    S = features[:, 0]
    K = features[:, 1]
    T = features[:, 2]
    r = features[:, 3]
    sigma = features[:, 4]
    
    # Calculate Moneyness
    moneyness = S / K
    
    # Stack the new, optimized feature set: shape (num_samples, 4)
    engineered_features = torch.stack([moneyness, T, r, sigma], dim=1)

    return engineered_features

def create_dataloaders(features, targets, batch_size=128, train_split=0.8):
    """
    Splits the data into training and validation sets and wraps them in DataLoaders.
    """
    # Format targets to be a column vector: shape (num_samples, 1)
    dataset = TensorDataset(features, targets.unsqueeze(1))
    
    # Calculate split sizes
    train_size = int(train_split * len(dataset))
    val_size = len(dataset) - train_size
    
    # Randomly split the dataset
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    return train_loader, val_loader


def load_market_data_from_csv(filepath="../data/raw/spx_market_chain.csv"):
    """
    Reads the empirical market CSV and converts it to PyTorch float32 tensors.
    """
    print(f"[*] Loading empirical market data from {filepath}...")
    df = pd.read_csv(filepath)
    
    # Extract features and force float32 to prevent PyTorch layer crashes
    S = torch.tensor(df['Underlying'].values, dtype=torch.float32)
    K = torch.tensor(df['Strike'].values, dtype=torch.float32)
    T = torch.tensor(df['Time_to_Maturity'].values, dtype=torch.float32)
    r = torch.tensor(df['Risk_Free_Rate'].values, dtype=torch.float32)

    sigma = torch.full_like(S, 0.15)
    
    # Extract targets (The real market prices containing the 'fear' premium)
    targets = torch.tensor(df['Market_Call_Price'].values, dtype=torch.float32)
    
    # Stack into our expected (N, 5) feature matrix
    features = torch.stack([S, K, T, r, sigma], dim=1)
    
    return features, targets

def create_csv_dataloaders(filepath="../data/raw/spx_market_chain.csv", batch_size=32, train_split=0.8):
    """
    Wraps the CSV market data into randomized PyTorch mini-batches.
    """
    features, targets = load_market_data_from_csv(filepath)
    dataset = TensorDataset(features, targets.unsqueeze(1))
    
    train_size = int(train_split * len(dataset))
    val_size = len(dataset) - train_size
    
    # Randomly split the market data
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    return train_loader, val_loader
