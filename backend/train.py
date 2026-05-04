import torch
import torch.optim as optim
from data_utils import preprocess_to_moneyness, create_dataloaders
from network import BSPricerNet
from loss_function import ArbitrageFreeLoss
from data_utils import create_csv_dataloaders, preprocess_to_moneyness 


def run_training_pipeline():

# 1. Configuration & Hyperparameters (UPDATED FOR CSV)
    EPOCHS = 100       # Massive increase because the dataset is tiny (200 rows)
    BATCH_SIZE = 32     # Smaller batches for more frequent weight updates
    LEARNING_RATE = 0.001
    
    print("[*] Booting up Empirical Market Pipeline...")
    # Point it to the CSV we generated!
    train_loader, val_loader = create_csv_dataloaders("data/raw/spx_market_chain.csv", BATCH_SIZE)
    
    # 2. Initialize the Architecture
    print("[*] Initializing BSPricerNet and ArbitrageFreeLoss...")
    model = BSPricerNet(input_dim=4, hidden_dim=128, num_layers=4)
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    # We heavily weight the penalties to force the network to learn finance, not just math
    criterion = ArbitrageFreeLoss(intrinsic_weight=2.0, negative_weight=2.0)
    
    # 3. The Optimization Loop
    print("[*] Beginning Training...")
    for epoch in range(EPOCHS):
        model.train() # Set model to training mode
        total_train_loss = 0.0
        
        for batch_features, batch_targets in train_loader:

  # Step A: Extract raw S and K (with locked column dimensions)
            S = batch_features[:, 0].view(-1, 1)
            K = batch_features[:, 1].view(-1, 1)
            
            # Step B: Feature Engineering (Moneyness) for the network
            nn_inputs = preprocess_to_moneyness(batch_features)
            
            # Step C: Forward Pass
            optimizer.zero_grad() 
            raw_nn_output = model(nn_inputs)
            # Restore the scale! Multiply by K to get absolute dollar price
            predictions = raw_nn_output * K
            
            # Step D: Calculate Arbitrage-Penalized Loss
            loss = criterion(predictions, batch_targets, S, K)
            
            # Step E: Backward Pass & Weight Update
            loss.backward()
            optimizer.step()
            
            total_train_loss += loss.item()
            
        # 4. Validation Phase (Checking for overfitting)
        model.eval() # Set model to evaluation mode
        total_val_loss = 0.0
        with torch.no_grad(): # Turn off gradient tracking to save memory
            for val_features, val_targets in val_loader:
                S_val = val_features[:, 0]
                K_val = val_features[:, 1]
                val_inputs = preprocess_to_moneyness(val_features)
                val_preds = model(val_inputs)
                v_loss = criterion(val_preds, val_targets, S_val, K_val)
                total_val_loss += v_loss.item()
                
        # Calculate average losses
        avg_train = total_train_loss / len(train_loader)
        avg_val = total_val_loss / len(val_loader)
        
        print(f"Epoch [{epoch+1}/{EPOCHS}] | Train Loss: {avg_train:.4f} | Val Loss: {avg_val:.4f}")

    print("[*] Training Complete. Model is ready for evaluation.")
    return model

if __name__ == "__main__":
    trained_model = run_training_pipeline()

    # THIS IS THE CRITICAL PART YOU MIGHT BE MISSING
    import torch
    torch.save(trained_model.state_dict(), "quant_net_weights.pth")
    print("[*] Model weights saved to quant_net_weights.pth")

