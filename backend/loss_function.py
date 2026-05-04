import torch
import torch.nn as nn

class ArbitrageFreeLoss(nn.Module):
    def __init__(self, intrinsic_weight=1.0, negative_weight=1.0):
        """
        Custom loss function that combines MSE with No-Arbitrage penalties.
        
        Args:
            intrinsic_weight (float): Multiplier for the intrinsic value penalty.
            negative_weight (float): Multiplier for the negative price penalty.
        """
        super(ArbitrageFreeLoss, self).__init__()
        self.mse = nn.MSELoss()
        
        # Hyperparameters to control how strictly we enforce the rules
        self.lambda_intrinsic = intrinsic_weight
        self.lambda_negative = negative_weight

    def forward(self, predictions, targets, S, K):
        """
        Calculates the total loss.
        
        Args:
            predictions (Tensor): The prices predicted by the neural network.
            targets (Tensor): The true Black-Scholes prices.
            S (Tensor): The stock prices for the batch.
            K (Tensor): The strike prices for the batch.
        """
        # 1. Base Machine Learning Loss (Mean Squared Error)
        base_loss = self.mse(predictions, targets)
        
        # 2. Financial Penalty 1: Negative Prices
        # If prediction is positive, -prediction is negative, relu returns 0 (no penalty).
        # If prediction is negative, -prediction is positive, relu returns the magnitude (penalty!).
        negative_penalty = torch.mean(torch.relu(-predictions))
        
        # 3. Financial Penalty 2: Intrinsic Value Violation
        # The intrinsic value of a call is (S - K).
        # We penalize if: (S - K) > prediction, which means (S - K) - prediction > 0
        intrinsic_value = S - K
        intrinsic_penalty = torch.mean(torch.relu(intrinsic_value - predictions))
        
        # 4. Total Loss Calculation
        total_loss = (base_loss 
                      + (self.lambda_negative * negative_penalty) 
                      + (self.lambda_intrinsic * intrinsic_penalty))
        
        return total_loss