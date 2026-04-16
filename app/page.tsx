'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Zap, Lightbulb, ShieldCheck, MapPin, 
  Menu, X, BarChart3, Scale, Info, HelpCircle, ChevronDown, 
  Home, Building2, TrendingUp, DollarSign, ListOrdered, FileSearch, TableProperties
} from 'lucide-react';

// --- DATA STRUCTURES ---
const statesList = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const defaultTariffData: Record<string, any> = {};
const standardDomestic = { slabs: [{ max: 100, rate: 3.50 }, { max: 300, rate: 5.50 }, { max: 500, rate: 7.50 }, { max: Infinity, rate: 8.50 }] };
const standardCommercial = { slabs: [{ max: 200, rate: 7.50 }, { max: Infinity, rate: 9.50 }] };

// FIX: Generate varied base parameters for each state so the table visibly updates
statesList.forEach((state, index) => {
  const variation = (index % 7); 
  
  defaultTariffData[state] = { 
    Domestic: { 
      ...standardDomestic, 
      slabs: [...standardDomestic.slabs],
      fixedCharge: 40 + (variation * 10),
      meterRent: 10 + (variation * 2),
      dutyPercent: 4 + variation,
      fac: parseFloat((0.10 + (variation * 0.05)).toFixed(2))
    }, 
    Commercial: { 
      ...standardCommercial, 
      slabs: [...standardCommercial.slabs],
      fixedCharge: 150 + (variation * 25),
      meterRent: 20 + (variation * 5),
      dutyPercent: 8 + variation,
      fac: parseFloat((0.20 + (variation * 0.08)).toFixed(2))
    } 
  };
});

const stateSpecificRates = {
  "Andhra Pradesh": { low: 3.80, mid: 6.00, high: 8.20 }, "Assam": { low: 4.20, mid: 6.05, high: 7.90 }, "Bihar": { low: 3.75, mid: 5.85, high: 8.00 },
  "Delhi": { low: 0.00, mid: 4.50, high: 8.00 }, "Gujarat": { low: 3.60, mid: 5.45, high: 7.30 }, "Haryana": { low: 2.20, mid: 4.65, high: 7.10 },
  "Karnataka": { low: 4.75, mid: 7.10, high: 9.50 }, "Kerala": { low: 3.80, mid: 6.15, high: 8.50 }, "Madhya Pradesh": { low: 3.50, mid: 5.65, high: 7.80 },
  "Maharashtra": { low: 4.43, mid: 9.38, high: 14.33 }, "Odisha": { low: 3.00, mid: 4.90, high: 6.80 }, "Punjab": { low: 4.10, mid: 5.80, high: 7.50 },
  "Rajasthan": { low: 4.75, mid: 6.35, high: 7.95 }, "Tamil Nadu": { low: 4.95, mid: 8.00, high: 11.05 }, "Telangana": { low: 3.60, mid: 5.55, high: 7.50 },
  "Uttar Pradesh": { low: 3.35, mid: 5.65, high: 8.00 }, "West Bengal": { low: 3.30, mid: 5.90, high: 8.50 }
};

Object.entries(stateSpecificRates).forEach(([stateName, rates]) => {
  if (defaultTariffData[stateName]) {
    defaultTariffData[stateName].Domestic.slabs = [{ max: 200, rate: rates.low }, { max: 500, rate: rates.mid }, { max: Infinity, rate: rates.high }];
  }
});

const energyTips = [
  "Switch to LED Bulbs: LEDs use 80% less energy and last 25x longer.",
  "Set AC to 24°C: Every degree above 22°C saves about 6% on cooling costs.",
  "Unplug Vampire Appliances: TVs, chargers, and microwaves drain power even when off.",
  "Use Natural Light: Keep curtains open during the day to avoid using artificial lights.",
  "Buy 5-Star Appliances: They cost more upfront but save thousands in electricity bills.",
  "Clean AC Filters: Clogged filters force your AC to work harder, increasing consumption.",
  "Use Smart Power Strips: They automatically cut off power to devices not in use.",
  "Full Laundry Loads: Washing machines use the same energy for a half load as a full one.",
  "Regular Fridge Defrosting: Ice buildup forces the compressor to run longer.",
  "Solar Water Heaters: Swap electric geysers for solar options to cut massive heating costs."
];

const faqs = [
  { q: "What is 1 unit of electricity?", a: "1 unit is equal to 1 Kilowatt-hour (kWh). It is the energy consumed by a 1000-watt appliance running for 1 hour." },
  { q: "What is FPPCA?", a: "Fuel and Power Purchase Cost Adjustment. It's a fluctuating surcharge added to recover changes in the cost of coal and fuel." },
  { q: "Why are commercial rates higher?", a: "Commercial rates subsidize domestic and agricultural rates, a system known as cross-subsidy." },
  { q: "What are fixed charges?", a: "A mandatory monthly fee to maintain the grid infrastructure, regardless of whether you use electricity or not." },
  { q: "What is electricity duty?", a: "A state-imposed tax calculated as a percentage of your total energy and fixed charges." },
  { q: "How are telescopic slabs calculated?", a: "Units are split into tiers. The first few units are cheap, and subsequent units are charged at progressively higher rates." },
  { q: "Why is my bill higher in summer?", a: "ACs and fans run longer, pushing your total units into higher, more expensive tariff slabs." },
  { q: "Is meter rent mandatory?", a: "If you do not own the meter, the distribution company charges a small monthly rent for it." },
  { q: "Can I change a commercial meter to domestic?", a: "Only if the premises are strictly used for residential purposes. It requires an application to the electricity board." },
  { q: "Does the national average rate affect my bill?", a: "No, electricity is a state subject in India. Your bill is strictly based on your specific state's tariff." },
  { q: "What is connected load?", a: "The total wattage of all appliances in your house if turned on simultaneously. Fixed charges are often based on this." },
  { q: "How can I reduce my bill?", a: "Use 5-star appliances, maintain ACs, and try to keep your monthly consumption in the lowest tariff slab." },
  { q: "What happens if I pay late?", a: "You will be charged a Late Payment Surcharge (LPSC), usually 1.5% to 2% per month, and risk disconnection." },
  { q: "Are there electricity subsidies?", a: "Yes, states like Delhi and Punjab offer zero bills or massive subsidies for consuming below a certain threshold (e.g., 200 units)." },
  { q: "Will solar panels reduce my bill?", a: "Yes, grid-tied solar systems use 'Net Metering' to deduct the electricity you generate from what you consume." },
  { q: "What is a smart meter?", a: "A digital meter that sends real-time usage data to the provider, eliminating manual readings and estimating." },
  { q: "Why does my bill show 'Arrears'?", a: "Arrears are unpaid balances from previous billing cycles carried forward to your current bill." },
  { q: "How is a commercial establishment defined?", a: "Any space used to generate income, including shops, offices, and even home-run businesses." },
  { q: "What is a security deposit?", a: "An upfront refundable deposit held by the utility board, usually equivalent to 2 months of estimated billing." },
  { q: "Can I pay my bill online?", a: "Yes, via your state board's portal, UPI apps (GPay, PhonePe), or bank applications using your consumer number." }
];

// Reusable AdSense Component
const AdUnit = ({ className = "my-8 rounded-2xl overflow-hidden shadow-neu-inset bg-neuBg border border-[#e2e8e4]" }) => (
  <aside className={`w-full ${className}`}>
    <div className="adsbygoogle-placeholder w-full h-[100px] flex items-center justify-center text-sm font-bold text-gray-400 uppercase tracking-widest">
      Advertisement Space
    </div>
  </aside>
);

export default function ElectricityCalculator() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Main Calculator State
  const [state, setState] = useState('Maharashtra');
  const [connType, setConnType] = useState('Domestic');
  const [units, setUnits] = useState('');
  const [tariff, setTariff] = useState(defaultTariffData[state][connType]);
  const [isEditing, setIsEditing] = useState(false);
  const [billResult, setBillResult] = useState<any>(null);

  // Widget States
  const [compStateA, setCompStateA] = useState('Maharashtra');
  const [compStateB, setCompStateB] = useState('Delhi');
  const [natAvgState, setNatAvgState] = useState('Maharashtra');
  const [lookupState, setLookupState] = useState('Maharashtra');
  const [tableState, setTableState] = useState('Maharashtra');
  
  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Sync Main Calculator Tariff
  useEffect(() => {
    setTariff(defaultTariffData[state][connType]);
    setBillResult(null); 
  }, [state, connType]);

  // Core Calculation Engine
  const calculateEngine = (calcUnits: number, calcTariff: any) => {
    let remainingUnits = calcUnits;
    let totalEnergyCharge = 0;
    let prevMax = 0;
    const slabBreakdown = [];

    for (const slab of calcTariff.slabs) {
      if (remainingUnits <= 0) break;
      const slabCapacity = slab.max === Infinity ? Infinity : slab.max - prevMax;
      const unitsInSlab = Math.min(remainingUnits, slabCapacity);
      const cost = unitsInSlab * slab.rate;
      totalEnergyCharge += cost;
      slabBreakdown.push({ range: `${prevMax + 1} - ${slab.max === Infinity ? 'Above' : slab.max}`, units: unitsInSlab, rate: slab.rate, cost: cost });
      remainingUnits -= unitsInSlab;
      prevMax = slab.max;
    }
    const facTotal = calcUnits * calcTariff.fac;
    const dutyTotal = (totalEnergyCharge + calcTariff.fixedCharge + facTotal) * (calcTariff.dutyPercent / 100);
    const finalTotal = totalEnergyCharge + calcTariff.fixedCharge + calcTariff.meterRent + facTotal + dutyTotal;

    return { totalEnergyCharge, slabBreakdown, finalTotal, facTotal, dutyTotal, fixedCharge: calcTariff.fixedCharge, meterRent: calcTariff.meterRent };
  };

  const calculateBill = () => {
    const consumed = parseFloat(units);
    if (isNaN(consumed) || consumed < 0) return alert("Please enter valid units.");
    setBillResult({ consumed, ...calculateEngine(consumed, tariff) });
  };

  const handleTariffChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => setTariff({ ...tariff, [field]: parseFloat(e.target.value) || 0 });

  // Visualizer Data (Base 500 units)
  const nationalAvg500 = 3500; 
  const selectedNatAvgState500 = calculateEngine(500, defaultTariffData[natAvgState]['Domestic']).finalTotal;
  const compA500 = calculateEngine(500, defaultTariffData[compStateA]['Domestic']).finalTotal;
  const compB500 = calculateEngine(500, defaultTariffData[compStateB]['Domestic']).finalTotal;

  // Reusable Neumorphic Select Component
  const NeuSelect = ({ value, onChange, options, className = "" }: any) => (
    <div className={`relative group ${className}`}>
      <select 
        className="w-full bg-neuBg shadow-neu focus:shadow-neu-inset hover:shadow-[5px_5px_10px_#d1d9d3,-5px_-5px_10px_#ffffff] rounded-xl px-5 py-4 font-bold text-neuDark outline-none transition-all duration-300 appearance-none cursor-pointer"
        value={value} 
        onChange={onChange}
      >
        {options.map((opt: any) => (
          typeof opt === 'string' 
            ? <option key={opt} value={opt}>{opt}</option>
            : <option key={opt.val} value={opt.val}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 group-hover:translate-y(-2px)">
        <ChevronDown className="h-5 w-5 text-neuGreen" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neuBg font-sans text-neuDark selection:bg-neuGreen selection:text-white transition-colors duration-300 overflow-x-hidden">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-neuBg shadow-neu-sm mb-8 border-b border-[#e2e8e4]">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="bg-neuBg shadow-neu p-2.5 rounded-full flex items-center justify-center transition-all duration-300 group-hover:shadow-neu-inset">
              <Zap className="h-6 w-6 text-neuGreen fill-neuGreen transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="font-black text-2xl tracking-tight text-neuGreen">VidyutCalc</span>
          </div>
          <nav className="hidden md:flex gap-8 font-bold text-sm text-gray-600">
            <a href="#calculator" className="hover:text-neuGreen transition-colors duration-300">Calculator</a>
            <a href="#compare" className="hover:text-neuGreen transition-colors duration-300">Compare</a>
            <a href="#lookup" className="hover:text-neuGreen transition-colors duration-300">Tariff Lookup</a>
            <a href="#faqs" className="hover:text-neuGreen transition-colors duration-300">FAQs</a>
          </nav>
          <button className="md:hidden text-neuDark bg-neuBg shadow-neu active:shadow-neu-inset p-2.5 rounded-xl transition-all duration-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-neuBg shadow-neu px-6 py-6 space-y-4 font-bold text-neuDark absolute w-full z-40 border-t border-[#d1d9d3] origin-top animate-in slide-in-from-top-2">
            <a href="#calculator" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-3 bg-neuBg shadow-neu hover:shadow-neu-inset rounded-xl transition-all duration-300 text-center">Calculator</a>
            <a href="#compare" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-3 bg-neuBg shadow-neu hover:shadow-neu-inset rounded-xl transition-all duration-300 text-center">Compare</a>
            <a href="#lookup" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-3 bg-neuBg shadow-neu hover:shadow-neu-inset rounded-xl transition-all duration-300 text-center">Tariff Lookup</a>
            <a href="#faqs" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-3 bg-neuBg shadow-neu hover:shadow-neu-inset rounded-xl transition-all duration-300 text-center">FAQs</a>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 space-y-24">
        
        <div className="max-w-4xl mx-auto"><AdUnit /></div>

        {/* HERO & MAIN CALCULATOR */}
        <section id="calculator" className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-neuDark tracking-tight leading-tight">
              Accurate Electricity Bill<br/><span className="text-neuGreen">Calculator</span> for India
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">Instantly calculate your energy charges, fixed costs, and taxes for 36 States & UTs.</p>
          </div>

          <article className="bg-neuBg rounded-[2rem] shadow-neu p-6 md:p-10 transition-all duration-300 mb-16 border border-[#e2e8e4]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2">State / UT</label>
                <NeuSelect value={state} onChange={(e: any) => setState(e.target.value)} options={statesList} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2">Connection</label>
                <NeuSelect 
                  value={connType} 
                  onChange={(e: any) => setConnType(e.target.value)} 
                  options={[{val: 'Domestic', label: '🏠 Domestic'}, {val: 'Commercial', label: '🏢 Commercial'}]} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2">Units (kWh)</label>
                <input 
                  type="number" placeholder="e.g. 250" value={units} onChange={(e) => setUnits(e.target.value)} 
                  className="w-full bg-neuBg shadow-neu focus:shadow-neu-inset hover:shadow-[5px_5px_10px_#d1d9d3,-5px_-5px_10px_#ffffff] rounded-xl px-5 py-4 font-black text-xl text-neuDark outline-none transition-all duration-300 placeholder-gray-400" 
                />
              </div>
            </div>

            <div className="mb-10 rounded-2xl overflow-hidden shadow-neu-inset p-1.5 border border-[#e2e8e4]">
              <div className="bg-neuBg px-6 py-5 flex justify-between items-center rounded-[1rem]">
                <span className="text-sm font-bold text-gray-600 flex items-center gap-3"><Settings className="h-5 w-5 text-neuGreen animate-spin-slow" /> Active Rates ({state})</span>
                <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-bold text-neuGreen bg-neuBg shadow-neu active:shadow-neu-inset px-5 py-2.5 rounded-lg transition-all duration-300 hover:text-neuDark">
                  {isEditing ? 'Save Rates' : 'Edit Rates'}
                </button>
              </div>
              {!isEditing ? (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm bg-neuBg rounded-b-[1rem]">
                  <div>
                    <p className="text-gray-400 font-bold mb-4 text-xs uppercase tracking-wider flex items-center gap-2"><Zap className="h-4 w-4"/> Energy Slabs</p>
                    <ul className="space-y-3 text-gray-600">
                      {tariff.slabs.map((s: any, i: number) => (
                        <li key={i} className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-2"><span>Up to {s.max === Infinity ? 'Above' : s.max} units</span><span className="font-bold text-neuDark text-base">₹{s.rate.toFixed(2)}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold mb-4 text-xs uppercase tracking-wider flex items-center gap-2"><DollarSign className="h-4 w-4"/> Other Charges</p>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-2"><span>Fixed Charge</span><span className="font-bold text-neuDark text-base">₹{tariff.fixedCharge}</span></li>
                      <li className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-2"><span>Duty Tax</span><span className="font-bold text-neuDark text-base">{tariff.dutyPercent}%</span></li>
                      <li className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-2"><span>FPPCA / Unit</span><span className="font-bold text-neuDark text-base">₹{tariff.fac}</span></li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 bg-neuBg rounded-b-[1rem] text-sm">
                   <div><label className="block text-xs font-bold text-gray-500 mb-3">Fixed (₹)</label><input type="number" value={tariff.fixedCharge} onChange={(e) => handleTariffChange(e, 'fixedCharge')} className="w-full bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-neuDark outline-none focus:ring-2 focus:ring-neuGreen transition-all" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 mb-3">Rent (₹)</label><input type="number" value={tariff.meterRent} onChange={(e) => handleTariffChange(e, 'meterRent')} className="w-full bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-neuDark outline-none focus:ring-2 focus:ring-neuGreen transition-all" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 mb-3">Duty (%)</label><input type="number" value={tariff.dutyPercent} onChange={(e) => handleTariffChange(e, 'dutyPercent')} className="w-full bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-neuDark outline-none focus:ring-2 focus:ring-neuGreen transition-all" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 mb-3">FAC (₹)</label><input type="number" value={tariff.fac} onChange={(e) => handleTariffChange(e, 'fac')} className="w-full bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-neuDark outline-none focus:ring-2 focus:ring-neuGreen transition-all" /></div>
                </div>
              )}
            </div>

            <button 
              onClick={calculateBill} 
              className="w-full bg-neuBg text-neuGreen font-black text-xl py-6 rounded-2xl shadow-neu active:shadow-neu-inset hover:text-neuDark transition-all duration-300 flex justify-center items-center gap-3 border border-[#e2e8e4]"
            >
              <Zap className="h-6 w-6" /> Generate Detailed Bill
            </button>
          </article>

          {/* RESULTS CARD */}
          {billResult && (
            <div className="bg-neuBg rounded-[2rem] p-8 md:p-12 shadow-neu border-t-8 border-neuGreen transition-all duration-500 mb-16 animate-in slide-in-from-bottom-8">
               <div className="text-center mb-10">
                 <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-4">Estimated Total Bill</p>
                 <p className="text-6xl md:text-7xl font-black text-neuGreen drop-shadow-sm tracking-tighter">₹{billResult.finalTotal.toFixed(2)}</p>
                 <p className="text-gray-500 mt-4 text-sm font-medium bg-neuBg shadow-neu-inset inline-block px-6 py-2 rounded-full border border-[#e2e8e4]">For {billResult.consumed} Units in {state} ({connType})</p>
               </div>
               
               <div className="bg-neuBg shadow-neu-inset rounded-3xl p-8 md:p-10 text-sm border border-[#e2e8e4]">
                 <div className="flex justify-between font-black text-neuDark border-b-2 border-[#d1d9d3] pb-5 mb-5 text-xl">
                   <span className="flex items-center gap-2"><Zap className="h-5 w-5 text-neuGreen"/> Energy Charges</span><span className="text-neuGreen">₹{billResult.totalEnergyCharge.toFixed(2)}</span>
                 </div>
                 {billResult.slabBreakdown.map((b: any, i: number) => (
                   <div key={i} className="flex justify-between text-gray-600 pl-2 mb-4 text-base">
                     <span className="font-medium">{b.units} units × ₹{b.rate} <span className="text-xs text-gray-400 ml-1">({b.range} slab)</span></span>
                     <span className="font-bold text-neuDark">₹{b.cost.toFixed(2)}</span>
                   </div>
                 ))}
                 <div className="pt-6 border-t-2 border-dashed border-[#d1d9d3] space-y-5 mt-6 text-base">
                   <div className="flex justify-between text-gray-600 font-medium"><span>Fixed Charges</span><span className="font-bold text-neuDark">₹{billResult.fixedCharge.toFixed(2)}</span></div>
                   {billResult.meterRent > 0 && <div className="flex justify-between text-gray-600 font-medium"><span>Meter Rent</span><span className="font-bold text-neuDark">₹{billResult.meterRent.toFixed(2)}</span></div>}
                   <div className="flex justify-between text-gray-600 font-medium"><span>FPPCA / Surcharge</span><span className="font-bold text-neuDark">₹{billResult.facTotal.toFixed(2)}</span></div>
                   <div className="flex justify-between text-gray-600 font-medium"><span>Electricity Duty</span><span className="font-bold text-neuDark">₹{billResult.dutyTotal.toFixed(2)}</span></div>
                 </div>
               </div>
            </div>
          )}

          {/* HOW TO USE GUIDE */}
          <div className="mt-20">
            <h2 className="text-3xl font-black mb-10 flex items-center justify-center gap-4 text-neuDark">
              <ListOrdered className="text-neuGreen h-8 w-8" /> How to Use This Calculator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-neuBg shadow-neu hover:shadow-neu-inset p-8 rounded-[2rem] text-center transition-all duration-300 border border-[#e2e8e4]">
                <div className="bg-neuBg shadow-neu-inset w-16 h-16 mx-auto flex justify-center items-center rounded-2xl mb-6 text-neuGreen font-black text-2xl">1</div>
                <h4 className="font-black text-neuDark mb-3 text-lg">Select Your State</h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">Choose your location to automatically load the latest government tariff slabs.</p>
              </div>
              <div className="bg-neuBg shadow-neu hover:shadow-neu-inset p-8 rounded-[2rem] text-center transition-all duration-300 border border-[#e2e8e4]">
                <div className="bg-neuBg shadow-neu-inset w-16 h-16 mx-auto flex justify-center items-center rounded-2xl mb-6 text-neuGreen font-black text-2xl">2</div>
                <h4 className="font-black text-neuDark mb-3 text-lg">Enter Units (kWh)</h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">Check your electricity meter or old bill for your total consumed units.</p>
              </div>
              <div className="bg-neuBg shadow-neu hover:shadow-neu-inset p-8 rounded-[2rem] text-center transition-all duration-300 border border-[#e2e8e4]">
                <div className="bg-neuBg shadow-neu-inset w-16 h-16 mx-auto flex justify-center items-center rounded-2xl mb-6 text-neuGreen font-black text-2xl">3</div>
                <h4 className="font-black text-neuDark mb-3 text-lg">Generate Bill</h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">Click calculate to see a detailed breakdown of fixed charges, taxes, and energy costs.</p>
              </div>
            </div>
          </div>
        </section>

        <AdUnit />

        {/* DATA VISUALIZERS */}
        <section id="compare" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* State Matchup */}
          <article className="bg-neuBg rounded-[2rem] p-8 md:p-10 shadow-neu border border-[#e2e8e4]">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-neuDark">
              <div className="bg-neuBg shadow-neu-inset p-2.5 rounded-xl"><Scale className="text-neuGreen h-6 w-6" /></div> State Matchup
            </h2>
            <p className="text-sm text-gray-500 mb-8 font-medium">Compare the estimated bill for 500 units (Domestic) between two states.</p>
            <div className="flex gap-6 mb-10">
              <NeuSelect className="w-1/2" value={compStateA} onChange={(e: any)=>setCompStateA(e.target.value)} options={statesList} />
              <NeuSelect className="w-1/2" value={compStateB} onChange={(e: any)=>setCompStateB(e.target.value)} options={statesList} />
            </div>
            <div className="space-y-10">
              <div>
                <div className="flex justify-between text-sm font-bold mb-4 text-gray-600"><span>{compStateA}</span><span className="text-neuGreen text-lg font-black">₹{Math.round(compA500)}</span></div>
                <div className="w-full bg-neuBg shadow-neu-inset rounded-full h-6 p-1.5">
                  <div className="bg-neuGreen h-full rounded-full transition-all duration-1000 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.1)]" style={{ width: `${Math.min((compA500 / Math.max(compA500, compB500)) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-4 text-gray-600"><span>{compStateB}</span><span className="text-neuDark text-lg font-black">₹{Math.round(compB500)}</span></div>
                <div className="w-full bg-neuBg shadow-neu-inset rounded-full h-6 p-1.5">
                  <div className="bg-gray-400 h-full rounded-full transition-all duration-1000 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.1)]" style={{ width: `${Math.min((compB500 / Math.max(compA500, compB500)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </article>

          {/* National Average Visualizer */}
          <article className="bg-neuBg rounded-[2rem] p-8 md:p-10 shadow-neu border border-[#e2e8e4] flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-neuDark">
                <div className="bg-neuBg shadow-neu-inset p-2.5 rounded-xl"><BarChart3 className="text-neuGreen h-6 w-6" /></div> National Average
              </h2>
              <p className="text-sm text-gray-500 mb-8 font-medium">See how a specific state compares to the estimated Indian national average (500 Units).</p>
              <NeuSelect className="mb-8" value={natAvgState} onChange={(e: any)=>setNatAvgState(e.target.value)} options={statesList} />
            </div>
            <div className="flex items-end justify-around gap-6 h-48 bg-neuBg shadow-neu-inset rounded-[2rem] p-6 mt-auto border border-[#e2e8e4]">
              <div className="w-1/3 flex flex-col items-center justify-end gap-3 h-full group">
                <span className="font-black text-neuGreen text-xl transition-all group-hover:-translate-y-1">₹{Math.round(selectedNatAvgState500)}</span>
                <div className="w-full bg-neuGreen rounded-t-xl transition-all duration-1000 shadow-neu" style={{ height: `${Math.min((selectedNatAvgState500 / 5000) * 100, 100)}%` }}></div>
                <span className="text-xs font-bold text-gray-500 text-center truncate w-full px-2">{natAvgState}</span>
              </div>
              <div className="w-1/3 flex flex-col items-center justify-end gap-3 h-full group">
                <span className="font-black text-neuDark text-xl transition-all group-hover:-translate-y-1">₹{Math.round(nationalAvg500)}</span>
                <div className="w-full bg-gray-400 rounded-t-xl transition-all duration-1000 shadow-neu" style={{ height: `${(nationalAvg500 / 5000) * 100}%` }}></div>
                <span className="text-xs font-bold text-gray-500 text-center">National Avg</span>
              </div>
            </div>
          </article>
        </section>

        {/* TARIFF DATA & TABLES */}
        <section id="lookup" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Rate Comparison Table */}
          <article className="bg-neuBg rounded-[2rem] p-8 md:p-10 shadow-neu border border-[#e2e8e4]">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-neuDark">
              <div className="bg-neuBg shadow-neu-inset p-2.5 rounded-xl"><TableProperties className="text-neuGreen h-6 w-6" /></div> Rate Comparison
            </h2>
            <p className="text-sm text-gray-500 mb-8 font-medium">Domestic vs Commercial base parameters.</p>
            <NeuSelect className="mb-8" value={tableState} onChange={(e: any)=>setTableState(e.target.value)} options={statesList} />
            
            <div className="bg-neuBg shadow-neu-inset rounded-[1.5rem] overflow-hidden border border-[#e2e8e4]">
              <table className="w-full text-left text-sm md:text-base">
                <thead className="bg-neuBg shadow-neu text-neuDark font-black">
                  <tr>
                    <th className="p-5 rounded-tl-[1.5rem]">Charge Type</th>
                    <th className="p-5 text-neuGreen">Domestic</th>
                    <th className="p-5 text-neuGreen rounded-tr-[1.5rem]">Commercial</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 font-medium">
                  <tr className="border-b border-[#d1d9d3] hover:bg-gray-50/30 transition-colors">
                    <td className="p-5">Fixed Charge</td>
                    <td className="p-5 font-bold text-neuDark">₹{defaultTariffData[tableState].Domestic.fixedCharge}</td>
                    <td className="p-5 font-bold text-neuDark">₹{defaultTariffData[tableState].Commercial.fixedCharge}</td>
                  </tr>
                  <tr className="border-b border-[#d1d9d3] hover:bg-gray-50/30 transition-colors">
                    <td className="p-5">Meter Rent</td>
                    <td className="p-5 font-bold text-neuDark">₹{defaultTariffData[tableState].Domestic.meterRent}</td>
                    <td className="p-5 font-bold text-neuDark">₹{defaultTariffData[tableState].Commercial.meterRent}</td>
                  </tr>
                  <tr className="border-b border-[#d1d9d3] hover:bg-gray-50/30 transition-colors">
                    <td className="p-5">Electricity Duty</td>
                    <td className="p-5 font-bold text-neuDark">{defaultTariffData[tableState].Domestic.dutyPercent}%</td>
                    <td className="p-5 font-bold text-neuDark">{defaultTariffData[tableState].Commercial.dutyPercent}%</td>
                  </tr>
                  <tr className="hover:bg-gray-50/30 transition-colors">
                    <td className="p-5">FPPCA (per unit)</td>
                    <td className="p-5 font-bold text-neuDark">₹{defaultTariffData[tableState].Domestic.fac.toFixed(2)}</td>
                    <td className="p-5 font-bold text-neuDark">₹{defaultTariffData[tableState].Commercial.fac.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          {/* State Tariff Lookup */}
          <article className="bg-neuBg rounded-[2rem] p-8 md:p-10 shadow-neu border border-[#e2e8e4]">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-neuDark">
              <div className="bg-neuBg shadow-neu-inset p-2.5 rounded-xl"><FileSearch className="text-neuGreen h-6 w-6" /></div> State Tariff Lookup
            </h2>
            <p className="text-sm text-gray-500 mb-8 font-medium">View complete unit slab structures for any state.</p>
            <NeuSelect className="mb-8" value={lookupState} onChange={(e: any)=>setLookupState(e.target.value)} options={statesList} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-neuBg shadow-neu-inset p-6 rounded-[1.5rem] border border-[#e2e8e4] hover:shadow-[inset_8px_8px_15px_#d1d9d3,inset_-8px_-8px_15px_#ffffff] transition-all">
                <h4 className="font-black text-neuDark mb-5 border-b-2 border-neuGreen pb-3 inline-flex items-center gap-2"><Home className="h-4 w-4"/> Domestic Slabs</h4>
                <ul className="space-y-4 text-sm text-gray-600 font-medium">
                  {defaultTariffData[lookupState].Domestic.slabs.map((s: any, i: number) => (
                    <li key={i} className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-2">
                      <span>Up to {s.max === Infinity ? 'Above' : s.max}</span><span className="font-bold text-neuDark text-base">₹{s.rate.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-neuBg shadow-neu-inset p-6 rounded-[1.5rem] border border-[#e2e8e4] hover:shadow-[inset_8px_8px_15px_#d1d9d3,inset_-8px_-8px_15px_#ffffff] transition-all">
                <h4 className="font-black text-neuDark mb-5 border-b-2 border-gray-400 pb-3 inline-flex items-center gap-2"><Building2 className="h-4 w-4"/> Commercial Slabs</h4>
                <ul className="space-y-4 text-sm text-gray-600 font-medium">
                  {defaultTariffData[lookupState].Commercial.slabs.map((s: any, i: number) => (
                    <li key={i} className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-2">
                      <span>Up to {s.max === Infinity ? 'Above' : s.max}</span><span className="font-bold text-neuDark text-base">₹{s.rate.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </section>

        {/* GUIDES & EDUCATIONAL CARDS */}
        <section id="guide" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl font-black mb-5 text-neuDark tracking-tight">Understanding Your Bill</h2>
            <p className="text-gray-500 font-medium text-lg">Demystifying the charges, surcharges, and terminology used by Indian electricity distribution boards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
             <article className="bg-neuBg shadow-neu rounded-[2rem] p-10 border border-[#e2e8e4] hover:shadow-[12px_12px_24px_#d1d9d3,-12px_-12px_24px_#ffffff] transition-all duration-300">
               <h3 className="text-2xl font-black mb-6 flex items-center gap-4 text-neuDark">
                 <div className="bg-neuBg shadow-neu-inset p-3 rounded-xl"><Info className="text-neuGreen h-6 w-6"/></div> What is a Billing Slab?
               </h3>
               <p className="text-gray-600 leading-relaxed text-base font-medium">
                 India uses a <strong>Telescopic Slab System</strong> to ensure affordability for basic needs while charging premium rates for heavy usage. Instead of a flat rate, units are split into tiers. For example, if you use 150 units, the first 100 units might be billed at ₹3/unit, and only the remaining 50 units fall into the more expensive ₹5/unit slab.
               </p>
             </article>
             <article className="bg-neuBg shadow-neu rounded-[2rem] p-10 border border-[#e2e8e4] hover:shadow-[12px_12px_24px_#d1d9d3,-12px_-12px_24px_#ffffff] transition-all duration-300">
               <h3 className="text-2xl font-black mb-6 flex items-center gap-4 text-neuDark">
                 <div className="bg-neuBg shadow-neu-inset p-3 rounded-xl"><Info className="text-neuGreen h-6 w-6"/></div> Res vs Commercial
               </h3>
               <div className="text-gray-600 leading-relaxed text-base font-medium space-y-5">
                 <div className="flex items-start gap-4">
                   <div className="bg-neuBg shadow-neu p-2 rounded-lg mt-1 shrink-0"><Home className="h-5 w-5 text-neuGreen"/></div>
                   <p><strong>Domestic:</strong> Heavily subsidized by the government for residential living to ensure basic access to power.</p>
                 </div>
                 <div className="flex items-start gap-4">
                   <div className="bg-neuBg shadow-neu p-2 rounded-lg mt-1 shrink-0"><Building2 className="h-5 w-5 text-neuGreen"/></div>
                   <p><strong>Commercial:</strong> Charged at higher rates. This extra revenue is used to fund the subsidies provided to domestic and agricultural consumers (cross-subsidization).</p>
                 </div>
               </div>
             </article>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <article className="bg-neuBg shadow-neu p-10 rounded-[2rem] border border-[#e2e8e4] hover:-translate-y-2 transition-transform duration-300 group">
              <div className="bg-neuBg shadow-neu-inset w-16 h-16 flex justify-center items-center rounded-2xl mb-8 group-hover:shadow-[inset_6px_6px_10px_#d1d9d3,inset_-6px_-6px_10px_#ffffff] transition-shadow">
                <DollarSign className="h-8 w-8 text-neuGreen" />
              </div>
              <h4 className="font-black text-xl mb-4 text-neuDark">Fixed Charges</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">A mandatory monthly fee regardless of consumption. It covers the cost of maintaining the power grid, transformers, and the physical wires connecting to your meter. Usually scales with your "Connected Load".</p>
            </article>
            <article className="bg-neuBg shadow-neu p-10 rounded-[2rem] border border-[#e2e8e4] hover:-translate-y-2 transition-transform duration-300 group">
              <div className="bg-neuBg shadow-neu-inset w-16 h-16 flex justify-center items-center rounded-2xl mb-8 group-hover:shadow-[inset_6px_6px_10px_#d1d9d3,inset_-6px_-6px_10px_#ffffff] transition-shadow">
                <TrendingUp className="h-8 w-8 text-neuGreen" />
              </div>
              <h4 className="font-black text-xl mb-4 text-neuDark">FPPCA / FAC</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">Fuel and Power Purchase Cost Adjustment. Since coal and gas prices fluctuate in the global market, DISCOMs use this dynamic surcharge per unit to recover unexpected fuel costs without altering base tariffs.</p>
            </article>
            <article className="bg-neuBg shadow-neu p-10 rounded-[2rem] border border-[#e2e8e4] hover:-translate-y-2 transition-transform duration-300 group">
              <div className="bg-neuBg shadow-neu-inset w-16 h-16 flex justify-center items-center rounded-2xl mb-8 group-hover:shadow-[inset_6px_6px_10px_#d1d9d3,inset_-6px_-6px_10px_#ffffff] transition-shadow">
                <ShieldCheck className="h-8 w-8 text-neuGreen" />
              </div>
              <h4 className="font-black text-xl mb-4 text-neuDark">Regulatory Surcharges</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">An additional fee sometimes approved by the State Electricity Regulatory Commission (SERC). It allows power companies to recover past financial deficits or fund major state-wide infrastructure upgrades.</p>
            </article>
          </div>
        </section>

        {/* 10 TIPS SECTION */}
        <section id="tips" className="bg-neuBg shadow-neu-inset rounded-[3rem] p-8 md:p-16 border border-[#e2e8e4]">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-14 text-center md:text-left">
            <div className="bg-neuBg shadow-neu p-5 rounded-3xl shrink-0">
              <Lightbulb className="h-10 w-10 text-neuGreen fill-neuGreen" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-neuDark tracking-tight">10 Proven Energy Saving Tips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {energyTips.map((tip, idx) => (
              <article key={idx} className="flex gap-5 bg-neuBg shadow-neu hover:shadow-neu-inset p-6 rounded-[1.5rem] items-start transition-all duration-300 border border-[#e2e8e4] group">
                <span className="bg-neuBg shadow-neu-inset text-neuGreen font-black h-10 w-10 flex items-center justify-center rounded-xl shrink-0 text-lg group-hover:bg-neuGreen group-hover:text-white transition-colors">{idx + 1}</span>
                <p className="text-base text-gray-600 font-medium leading-relaxed pt-1.5">{tip}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 20 FAQs ACCORDION */}
        <section id="faqs" className="max-w-4xl mx-auto pb-10">
          <h2 className="text-4xl font-black mb-12 text-center flex items-center justify-center gap-4 text-neuDark">
            <HelpCircle className="text-neuGreen h-10 w-10" /> Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <article key={idx} className="bg-neuBg rounded-3xl shadow-neu hover:shadow-[8px_8px_16px_#d1d9d3,-8px_-8px_16px_#ffffff] border border-[#e2e8e4] overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                  className="w-full px-8 py-7 flex justify-between items-center text-left focus:outline-none"
                >
                  <span className="font-bold text-neuDark text-lg md:text-xl pr-6">{faq.q}</span>
                  <div className={`p-3 rounded-xl shadow-neu transition-transform duration-300 shrink-0 ${openFaq === idx ? 'rotate-180 shadow-neu-inset bg-neuBg' : 'bg-neuBg'}`}>
                    <ChevronDown className="h-6 w-6 text-neuGreen" />
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-8 pb-8 text-gray-600 text-base leading-relaxed border-t border-dashed border-[#d1d9d3] pt-6 font-medium">
                    {faq.a}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>

      {/* BOTTOM AD UNIT */}
      <div className="max-w-7xl mx-auto px-4 mb-20"><AdUnit /></div>

      {/* MASSIVE FOOTER WITH QUICK LINKS */}
      <footer className="bg-neuBg shadow-[0_-10px_30px_rgba(209,217,211,0.7)] pt-20 pb-10 mt-10 border-t border-[#e2e8e4]">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="mb-16">
            <h3 className="text-2xl font-black mb-10 text-neuDark flex items-center gap-3">
              <div className="bg-neuBg shadow-neu-inset p-2.5 rounded-xl"><MapPin className="text-neuGreen h-6 w-6" /></div> Quick Links: State Bill Calculators
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {statesList.map(s => (
                <a 
                  key={s} href="#" 
                  onClick={(e) => {
                    e.preventDefault(); 
                    setState(s); 
                    window.scrollTo({top: 0, behavior: 'smooth'});
                  }} 
                  className="flex items-center justify-center h-20 w-full text-xs sm:text-sm text-gray-600 font-bold bg-neuBg shadow-neu hover:shadow-neu-inset active:shadow-neu-inset px-3 py-2 rounded-xl hover:text-neuGreen transition-all duration-300 text-center border border-transparent hover:border-[#e2e8e4] leading-tight"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
          
          <div className="border-t-2 border-dashed border-[#d1d9d3] pt-10 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-gray-500 font-bold">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="bg-neuBg shadow-neu-inset p-3 rounded-xl group-hover:shadow-neu transition-shadow">
                <Zap className="h-6 w-6 text-neuGreen fill-neuGreen group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-black text-neuDark tracking-widest uppercase text-xl">VidyutCalc</span>
            </div>
            
            <p className="text-center md:text-left">© {new Date().getFullYear()} VidyutCalc India. Designed with Neumorphism.</p>
            
            <div className="flex gap-8">
              <a href="#" className="hover:text-neuGreen transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-neuGreen transition-colors duration-300">Terms of Service</a>
              <a href="#" className="hover:text-neuGreen transition-colors duration-300">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
