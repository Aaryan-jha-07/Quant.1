import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery, getPredictions } from './store/marketDataSlice';
import VolatilityChart from './components/volatilityChart';
import PortfolioTable from './components/PortfolioTable';

function App() {
    const dispatch = useDispatch();
    const { searchQuery, neuralNetResults, isLoading } = useSelector((state) => state.marketData);
    const [inputValue, setInputValue] = useState(searchQuery);
    
    // Dynamic sliders state
    const [params, setParams] = useState({ S: 4500, K: 4500, T: 0.25, r: 0.04, sigma: 0.15 });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue !== searchQuery) dispatch(setSearchQuery(inputValue));
        }, 500); 
        return () => clearTimeout(timer);
    }, [inputValue, searchQuery, dispatch]);

    const handleRunModel = () => {
        dispatch(getPredictions({ ...params, S: params.K })); // Sync S with K for the UI demo
    };

    return (
        <div className="min-h-screen bg-[#f4f1ea] selection:bg-[#111] selection:text-[#f4f1ea]">
            <header className="pt-10 px-6 md:px-12 border-b-[12px] border-[#111]">
                <h1 className="text-[9vw] leading-[0.8] font-black uppercase tracking-tighter text-[#111] ">
                    Quant<span className="italic text-[#8c7b65]">-</span>Net
                </h1>
                <div className="flex flex-col md:flex-row justify-between items-end mt-8 pb-6 border-b border-[#111]">
                    <h2 className="text-3xl md:text-5xl italic text-[#4a3f32]">The Terminal Layout</h2>
                    <div className="text-right mt-4 md:mt-0 font-sans uppercase tracking-[0.3em] text-xs font-bold text-[#111]">
                        <p>Arbitrage-Free Neural Options Pricing</p>
                        <p className="text-[#8c7b65]">Issue No. 01 / MMXVI</p>
                    </div>
                </div>
            </header>

            <main className="flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-12 border-b-[12px] border-[#111]">
                    
                    {/* Left Column Controls */}
                    <div className="col-span-1 lg:col-span-4 p-8 md:p-12 border-r-[3px] border-[#111] bg-[#fdfbf7]">
                        <div className="mb-10">
                            <h3 className="text-7xl font-black uppercase leading-none tracking-tighter mb-4">Edit O.</h3>
                            <p className="font-sans text-sm font-bold uppercase tracking-widest text-[#8c7b65] border-b-2 border-[#111] pb-2">
                                System Parameters
                            </p>
                        </div>

                        <p className="text-lg leading-relaxed mb-10 text-justify text-[#2c241b]">
                            <span className="float-left text-6xl leading-[0.8] pr-2 font-black">T</span>
                            o run the deep learning inference engine, the analyst must adjust the variables below. The network utilizes an Arbitrage-Free Loss function to strictly guarantee financial constraints across the pricing surface.
                        </p>

                        <div className="mb-8">
                            <label className="block font-sans text-xs font-bold uppercase tracking-widest mb-2 text-[#111]">Target Asset</label>
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value.toUpperCase())} placeholder="Enter Ticker..."
                                className="w-full bg-transparent border-b-2 border-[#111] py-2 text-2xl font-bold uppercase focus:outline-none focus:border-[#8c7b65] transition-colors font-sans" />
                        </div>

                        {/* Dynamic Sliders */}
                        <div className="space-y-6 mb-8 border-y-2 border-[#111] py-6">
                            <div>
                                <div className="flex justify-between font-sans text-xs font-bold uppercase tracking-widest text-[#111] mb-2">
                                    <span>Asset / Strike Price (S, K)</span>
                                    <span className="text-[#8c7b65]">${params.K}</span>
                                </div>
                                <input type="range" min="10" max="6000" step="1" value={params.K} 
                                    onChange={(e) => setParams({...params, K: parseFloat(e.target.value)})}
                                    className="w-full accent-[#2c241b]" />
                            </div>
                            <div>
                                <div className="flex justify-between font-sans text-xs font-bold uppercase tracking-widest text-[#111] mb-2">
                                    <span>Time to Expiry (Years)</span>
                                    <span className="text-[#8c7b65]">{params.T}</span>
                                </div>
                                <input type="range" min="0.05" max="2.0" step="0.05" value={params.T} 
                                    onChange={(e) => setParams({...params, T: parseFloat(e.target.value)})}
                                    className="w-full accent-[#2c241b]" />
                            </div>
                            <div>
                                <div className="flex justify-between font-sans text-xs font-bold uppercase tracking-widest text-[#111] mb-2">
                                    <span>Implied Volatility (σ)</span>
                                    <span className="text-[#8c7b65]">{(params.sigma * 100).toFixed(0)}%</span>
                                </div>
                                <input type="range" min="0.05" max="0.80" step="0.01" value={params.sigma} 
                                    onChange={(e) => setParams({...params, sigma: parseFloat(e.target.value)})}
                                    className="w-full accent-[#2c241b]" />
                            </div>
                        </div>

                        <button onClick={handleRunModel} disabled={isLoading}
                            className="w-full bg-[#111] hover:bg-[#2c241b] text-[#f4f1ea] font-sans uppercase tracking-[0.2em] text-sm font-bold py-5 transition-all border-2 border-transparent disabled:opacity-50">
                            {isLoading ? 'Computing...' : 'Calculate Projection'}
                        </button>
                    </div>

                    {/* Right Column Terminal */}
                    <div className="col-span-1 lg:col-span-8 bg-[#0f0f0f] text-[#f4f1ea] p-6 md:p-10 relative overflow-hidden">
                        <div className="border-5 border-double border-[#c5a059] h-full w-full p-10 md:p-14 relative flex flex-col">
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#c5a059]"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#c5a059]"></div>
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#c5a059]"></div>
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#c5a059]"></div>

                            <h3 className="font-sans text-sm font-bold uppercase tracking-[0.3em] text-[#c5a059] text-center mb-10 border-b border-[#c5a059]/30 pb-4">
                                Neural Calculation Engine
                            </h3>

                            <div className="grid grid-cols-3 gap-8 mb-12">
                                {['Price', 'Delta', 'Gamma'].map((greek, idx) => (
                                    <div key={greek} className={`text-center ${idx !== 2 ? 'border-r border-[#c5a059]/20' : ''}`}>
                                        <p className="font-sans text-xs uppercase tracking-widest text-[#8c7b65] mb-2">{greek}</p>
                                        <p className="text-4xl md:text-5xl font-serif">
                                            {neuralNetResults[greek.toLowerCase()]?.toFixed(4) || "0.0000"}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex-grow bg-[#1a1a1a] border border-[#c5a059]/30 p-4 relative">
                                <p className="absolute top-4 left-4 font-sans text-[10px] uppercase tracking-widest text-[#8c7b65] z-10">Fig 1. Volatility Surface</p>
                                <VolatilityChart />
                            </div>
                        </div>
                    </div>
                </div>

                <section className="p-6 md:p-12 bg-[#fdfbf7]">
                    <div className="flex justify-between items-baseline border-b-[6px] border-[#111] pb-4 mb-8">
                        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">Manifest</h2>
                        <p className="font-sans text-xs font-bold uppercase tracking-widest text-[#8c7b65]">Active Portfolios</p>
                    </div>
                    <PortfolioTable />
                </section>
            </main>
        </div>
    );
}

export default App;