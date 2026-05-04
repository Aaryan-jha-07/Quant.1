import torch
import matplotlib.pyplot as plt
from data_utils import black_scholes_call, preprocess_to_moneyness

def extract_and_plot_greeks(model):
    print("[*] Running Comprehensive Autograd Evaluation...")
    model.eval() 
    
# 1. Define the Market Environment (UPDATED TO MATCH CSV)
    # Sweep the S&P 500 price from a massive crash (3500) to a massive rally (5500)
    S = torch.linspace(3500.0, 5500.0, 100, requires_grad=True)
    
    # Hold Strike at the current market level (4500)
    K = torch.full_like(S, 4500.0) 
    
    # Match the CSV exactly: 3 months to expiration, 4% risk-free rate
    T = torch.full_like(S, 0.25)
    r = torch.full_like(S, 0.04)
    
    # The Trap: We feed BOTH models a flat, theoretical 15% volatility.
    sigma = torch.full_like(S, 0.15)
    
    # 2. Mathematical Baseline (True Black-Scholes)
    bs_price = black_scholes_call(S, K, T, r, sigma)
    
    # BS Delta (First Derivative)
    bs_delta = torch.autograd.grad(
        outputs=bs_price, inputs=S, 
        grad_outputs=torch.ones_like(bs_price), 
        create_graph=True # Keep graph alive for the second derivative!
    )[0]
    
    # BS Gamma (Second Derivative)
    bs_gamma = torch.autograd.grad(
        outputs=bs_delta, inputs=S, 
        grad_outputs=torch.ones_like(bs_delta), 
        create_graph=False # We don't need a third derivative, so we can free the memory
    )[0]
    
    # 3. Neural Network Extraction
    features = torch.stack([S, K, T, r, sigma], dim=1)
    nn_inputs = preprocess_to_moneyness(features)
    
    # Price (Remember the scaling fix!)
    nn_price = model(nn_inputs).squeeze() * K
    
    # NN Delta (First Derivative)
    nn_delta = torch.autograd.grad(
        outputs=nn_price, inputs=S, 
        grad_outputs=torch.ones_like(nn_price), 
        create_graph=True 
    )[0]
    
    # NN Gamma (Second Derivative)
    nn_gamma = torch.autograd.grad(
        outputs=nn_delta, inputs=S, 
        grad_outputs=torch.ones_like(nn_delta), 
        create_graph=False 
    )[0]
    
    # 4. Rendering the Dashboard
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(18, 5))
    
    # Plot 1: Pricing Surface
    ax1.plot(S.detach().numpy(), bs_price.detach().numpy(), label="True BS Price", color='blue', linewidth=3)
    ax1.plot(S.detach().numpy(), nn_price.detach().numpy(), label="NN Price", color='red', linestyle='dashed', linewidth=2)
    ax1.set_title("Pricing Surface (Call vs Stock)")
    ax1.axvline(x=4500, color='gray', linestyle=':')
    ax1.legend(); ax1.grid(True, alpha=0.3)
    
    # Plot 2: Delta (Linear Sensitivity)
    ax2.plot(S.detach().numpy(), bs_delta.detach().numpy(), label="True BS Delta", color='blue', linewidth=3)
    ax2.plot(S.detach().numpy(), nn_delta.detach().numpy(), label="NN Delta", color='red', linestyle='dashed', linewidth=2)
    ax2.set_title("Delta Sensitivity (dC/dS)")
    ax2.axvline(x=4500, color='gray', linestyle=':')
    ax2.legend(); ax2.grid(True, alpha=0.3)
    
    # Plot 3: Gamma (Convexity / Risk of Delta changing)
    ax3.plot(S.detach().numpy(), bs_gamma.detach().numpy(), label="True BS Gamma", color='blue', linewidth=3)
    ax3.plot(S.detach().numpy(), nn_gamma.detach().numpy(), label="NN Gamma", color='red', linestyle='dashed', linewidth=2)
    ax3.set_title("Gamma Convexity (d²C/dS²)")
    ax3.axvline(x=4500, color='gray', linestyle=':')
    ax3.legend(); ax3.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()