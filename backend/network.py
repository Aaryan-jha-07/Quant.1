import torch
import torch.nn as nn

class BSPricerNet(nn.Module):
    def __init__(self, input_dim=4, hidden_dim=128, num_layers=4):
        """
        A deep neural network designed to learn the Black-Scholes pricing surface.
        
        Args:
            input_dim (int): Number of features (Moneyness, T, r, sigma = 4).
            hidden_dim (int): Number of neurons in each hidden layer.
            num_layers (int): Number of hidden layers.
        """
        super(BSPricerNet, self).__init__()
        
        # We use a ModuleList to dynamically build the network depth based on num_layers
        layers = []
        
        # 1. Input Layer
        layers.append(nn.Linear(input_dim, hidden_dim))
        layers.append(nn.Softplus()) # Smooth activation for continuous Greeks
        
        # 2. Hidden Layers
        for _ in range(num_layers - 1):
            layers.append(nn.Linear(hidden_dim, hidden_dim))
            layers.append(nn.Softplus())
            
        # 3. Output Layer (Predicts a single value: the option price)
        layers.append(nn.Linear(hidden_dim, 1))
        
        # 4. Final Output Activation
        # We apply one final Softplus to the output. Why? Because an option price 
        # can NEVER be negative. This mathematically guarantees C > 0.
        layers.append(nn.Softplus())
        
        # Unpack the list of layers into a Sequential container
        self.model = nn.Sequential(*layers)

    def forward(self, x):
        """
        Defines the forward pass of the data through the network.
        """
        return self.model(x)