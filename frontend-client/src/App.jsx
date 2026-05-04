import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery, getPredictions } from './store/marketDataSlice';
import VolatilityChart from './components/volatilityChart'; // Correct lowercase 'v' for Vercel
import PortfolioTable from './components/PortfolioTable';

function App() {
  const dispatch = useDispatch();
  
  // Pulling state from your Redux store
  const { searchQuery, neuralNetResults, isLoading } = useSelector((state) => state.marketData);
  const [inputValue, setInputValue] = useState(searchQuery);

  // Dynamic sliders state for the Black-Scholes/Neural parameters
  const [params, setParams] = useState({ 
    S: 4500, 
    K: 4500, 
    T: 0.25, 
    r: 0.04, 
    sigma: 0.15 
  });

  // Debounce logic: Only update Redux search query after user stops typing for 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchQuery) {
        dispatch(setSearchQuery(inputValue));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, searchQuery, dispatch]);

  // Handle slider changes
  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans selection:bg-[#C1A173] selection:text-black">
      
      {/* --- MAIN TERMINAL CONTAINER --- */}
      <div className="max-w-6xl mx-auto border border-[#C1A173]/30 p-6 md:p-12 relative">
        
        {/* Decorative Gold Corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#C1A173]"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#C1A173]"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#C1A173]"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#C1A173]"></div>

        {/* --- HEADER --- */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <h1 className="text-xl md:text-2xl tracking-[0.3em] text-[#C1A173] uppercase font-light">
            Neural Calculation Engine
          </h1>
          
          {/* Search/Ticker Input */}
          <div className="w-full md:w-64 relative">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="ENTER TICKER..."
              className="w-full bg-transparent border-b border-[#C1A173]/50 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#C1A173] uppercase tracking-widest text-sm transition-colors"
            />
          </div>
        </header>

        {/* --- STATS SECTION (MOBILE FIXED) --- */}
        <div className="flex flex-wrap justify-between gap-6 mb-12 w-full border-b border-[#C1A173]/20 pb-8">
          
          <div className="flex flex-col">
            <span className="text-xs tracking-widest text-[#C1A173] uppercase mb-2">Price</span>
            <span className="text-4xl md:text-6xl font-serif text-white tracking-tighter">
              {/* Fallback to 0.0000 if data is loading/missing */}
              {neuralNetResults?.price?.toFixed(4) || "0.0000"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs tracking-widest text-[#C1A173] uppercase mb-2">Delta</span>
            <span className="text-4xl md:text-6xl font-serif text-white tracking-tighter">
              {neuralNetResults?.delta?.toFixed(4) || "0.0000"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs tracking-widest text-[#C1A173] uppercase mb-2">Gamma</span>
            <span className="text-4xl md:text-6xl font-serif text-white tracking-tighter">
              {neuralNetResults?.gamma?.toFixed(4) || "0.0000"}
            </span>
          </div>

        </div>

        {/* --- GRID LAYOUT FOR CHART & CONTROLS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Side: Volatility Chart (Spans 2 columns on large screens) */}
          <div className="lg:col-span-2">
            <VolatilityChart data={neuralNetResults?.chartData || []} />
          </div>

          {/* Right Side: Parameter Sliders */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs tracking-widest text-gray-500 uppercase mb-4">
              Model Parameters
            </h3>

            {/* Reusable Slider Block */}
            {Object.keys(params).map((key) => (
              <div key={key} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm tracking-widest text-[#C1A173] uppercase">{key}</span>
                  <span className="text-sm font-serif">{params[key]}</span>
                </div>
                <input 
                  type="range" 
                  name={key}
                  min={key === 'S' || key === 'K' ? 1000 : 0}
                  max={key === 'S' || key === 'K' ? 6000 : 1}
                  step={key === 'S' || key === 'K' ? 10 : 0.01}
                  value={params[key]}
                  onChange={handleParamChange}
                  className="w-full accent-[#C1A173] h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}

            {/* Calculate Button */}
            <button 
              onClick={() => dispatch(getPredictions(params))}
              disabled={isLoading}
              className="mt-8 w-full border border-[#C1A173] text-[#C1A173] hover:bg-[#C1A173] hover:text-black py-4 text-xs tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Computing...' : 'Recalculate Model'}
            </button>
          </div>
        </div>

        {/* --- PORTFOLIO TABLE --- */}
        <div className="mt-16">
          <PortfolioTable />
        </div>

      </div>
    </div>
  );
}

export default App;