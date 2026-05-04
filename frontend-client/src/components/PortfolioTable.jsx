import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteStrategy, addStrategy } from '../store/portfolioSlice';

const PortfolioTable = () => {
    const dispatch = useDispatch();
    const strategies = useSelector((state) => state.portfolio.savedStrategies);
    
    // NEW: We are pulling the LIVE data from your marketData Redux state!
    const { searchQuery, neuralNetResults } = useSelector((state) => state.marketData);

    const handleAddNewStrategy = () => {
        // Now, we use the actual dynamic data instead of hardcoded strings
        const newStrategy = {
            id: Date.now().toString(), 
            name: `Neural Call Option`, // You can make this dynamic later if you add Put/Call toggles
            ticker: searchQuery || 'UNKNOWN', // Grabs the exact ticker you typed in the box!
            netPremium: neuralNetResults.price || 0, // Grabs the exact price the PyTorch model just calculated!
            date: new Date().toISOString().split('T')[0] 
        };
        dispatch(addStrategy(newStrategy));
    };

    return (
        <div className="overflow-x-auto border-t-[3px] border-[#111] pt-4 mt-8">
            
            <div className="flex justify-between items-center mb-4 px-2">
                <p className="font-sans text-xs uppercase tracking-widest text-[#8c7b65] font-bold">
                    System Ledger
                </p>
                <button 
                    onClick={handleAddNewStrategy}
                    className="bg-[#111] hover:bg-[#c5a059] text-[#f4f1ea] font-sans text-xs font-bold uppercase tracking-widest px-4 py-2 transition-colors cursor-pointer"
                >
                    + Add to Ledger
                </button>
            </div>

            <table className="w-full text-left border-collapse font-sans">
                <thead>
                    <tr className="border-b-2 border-[#111] text-xs uppercase tracking-widest text-[#111]">
                        <th className="px-6 py-4 font-bold">Strategy Name</th>
                        <th className="px-6 py-4 font-bold">Ticker</th>
                        <th className="px-6 py-4 font-bold">Inferred Premium</th>
                        <th className="px-6 py-4 font-bold">Date Initiated</th>
                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[#d1c8b4]">
                    {strategies.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-10 text-center text-[#8c7b65] italic font-serif">
                                The ledger is currently empty.
                            </td>
                        </tr>
                    ) : (
                        strategies.map((strat) => (
                            <tr key={strat.id} className="hover:bg-[#fdfbf7] transition-colors group text-[#2c241b]">
                                <td className="px-6 py-5 font-bold font-serif text-lg">{strat.name}</td>
                                <td className="px-6 py-5">
                                    <span className="border border-[#111] px-2 py-1 text-xs font-bold tracking-widest uppercase">
                                        {strat.ticker}
                                    </span>
                                </td>
                                <td className="px-6 py-5 font-mono font-bold">
                                    {/* Displays the PyTorch calculated price */}
                                    ${Number(strat.netPremium).toFixed(2)}
                                </td>
                                <td className="px-6 py-5 text-[#8c7b65] text-xs tracking-widest uppercase">{strat.date}</td>
                                <td className="px-6 py-5 text-right">
                                    <button 
                                        onClick={() => dispatch(deleteStrategy(strat.id))}
                                        className="text-xs uppercase tracking-widest font-bold text-[#8c7b65] hover:text-red-800 transition-colors cursor-pointer"
                                    >
                                        [ Terminate ]
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PortfolioTable;