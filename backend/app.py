from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from network import BSPricerNet
from data_utils import preprocess_to_moneyness

app = FastAPI()

# Allow React to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load your trained neural network
print("[*] Loading Arbitrage-Free Neural Network...")
model = BSPricerNet(input_dim=4, hidden_dim=128, num_layers=4)
model.load_state_dict(torch.load("quant_net_weights.pth"))
model.eval() # Set to evaluation mode

# 2. Define the incoming data structure from React
class MarketData(BaseModel):
    S: float  # Stock Price
    K: float  # Strike Price
    T: float  # Time to Maturity
    r: float  # Risk Free Rate
    sigma: float # Implied Volatility

@app.post("/api/predict-greeks")
def predict_options_data(data: MarketData):
    # 3. Convert incoming React numbers into PyTorch Tensors
    S = torch.tensor([data.S], requires_grad=True, dtype=torch.float32)
    K = torch.tensor([data.K], dtype=torch.float32)
    T = torch.tensor([data.T], dtype=torch.float32)
    r = torch.tensor([data.r], dtype=torch.float32)
    sigma = torch.tensor([data.sigma], dtype=torch.float32)

    # 4. Run the data through your custom preprocessing
    features = torch.stack([S, K, T, r, sigma], dim=1)
    nn_inputs = preprocess_to_moneyness(features)

    # 5. Calculate Price and Greeks using Autograd
    nn_price_raw = model(nn_inputs).squeeze()
    nn_price = nn_price_raw * K # Re-scale by Strike

    nn_delta = torch.autograd.grad(nn_price, S, create_graph=True)[0]
    nn_gamma = torch.autograd.grad(nn_delta, S, create_graph=False)[0]

    # 6. Send the payload back to React
    return {
        "price": nn_price.item(),
        "delta": nn_delta.item(),
        "gamma": nn_gamma.item()
    }