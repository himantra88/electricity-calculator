'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, ChevronRight, Zap, Lightbulb, BookOpen, ShieldCheck, MapPin, 
  Menu, X, BarChart3, Scale, Info, HelpCircle, ChevronDown, BatteryCharging, 
  Sun, Wind, Home, Building2, TrendingUp, DollarSign, ListOrdered, FileSearch, TableProperties
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
const standardDomestic = { slabs: [{ max: 100, rate: 3.50 }, { max: 300, rate: 5.50 }, { max: 500, rate: 7.50 }, { max: Infinity, rate: 8.50 }], fixedCharge: 50, meterRent: 10, dutyPercent: 5, fac: 0.10 };
const standardCommercial = { slabs: [{ max: 200, rate: 7.50 }, { max: Infinity, rate: 9.50 }], fixedCharge: 200, meterRent: 20, dutyPercent: 10, fac: 0.20 };

statesList.forEach(state => {
  defaultTariffData[state] = { Domestic: { ...standardDomestic, slabs: [...standardDomestic.slabs] }, Commercial: { ...standardCommercial, slabs: [...standardCommercial.slabs] } };
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
const AdUnit = ({ className = "my-8 rounded-xl overflow-hidden shadow-neu-inset bg-neuBg" }) => (
  <aside className={`w-full ${className}`}>
    <div className="adsbygoogle-placeholder w-full rounded-xl">
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

  // SEO Schema
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "India Electricity Bill Calculator",
        "applicationCategory": "CalculatorApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "description": "Calculate electricity bills for 36 Indian states using latest telescopic tariff slabs."
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-neuBg font-sans text-neuDark selection:bg-neuGreen selection:text-white transition-colors duration-300">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-neuBg shadow-neu-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="bg-neuBg shadow-neu p-2 rounded-full flex items-center justify-center">
              <Zap className="h-6 w-6 text-neuGreen fill-neuGreen transition-transform duration-300 hover:scale-110" />
            </div>
            <span className="font-black text-2xl tracking-tight text-neuGreen">VidyutCalc</span>
          </div>
          <nav className="hidden md:flex gap-8 font-bold text-sm text-gray-600">
            <a href="#calculator" className="hover:text-neuGreen transition-colors duration-300">Calculator</a>
            <a href="#compare" className="hover:text-neuGreen transition-colors duration-300">Compare</a>
            <a href="#lookup" className="hover:text-neuGreen transition-colors duration-300">Tariff Lookup</a>
            <a href="#faqs" className="hover:text-neuGreen transition-colors duration-300">FAQs</a>
          </nav>
          <button className="md:hidden text-neuDark bg-neuBg shadow-neu p-2 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-neuBg shadow-neu px-4 py-4 space-y-4 font-semibold text-neuDark absolute w-full z-40 border-t border-[#d1d9d3]">
            <a href="#calculator" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-2 hover:text-neuGreen shadow-neu-inset rounded-lg">Calculator</a>
            <a href="#compare" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-2 hover:text-neuGreen shadow-neu-inset rounded-lg">Compare</a>
            <a href="#lookup" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-2 hover:text-neuGreen shadow-neu-inset rounded-lg">Tariff Lookup</a>
            <a href="#faqs" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-2 hover:text-neuGreen shadow-neu-inset rounded-lg">FAQs</a>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 space-y-20">
        
        {/* TOP AD */}
        <div className="max-w-4xl mx-auto"><AdUnit /></div>

        {/* HERO & MAIN CALCULATOR */}
        <section id="calculator" className="max-w-4xl mx-auto py-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-neuDark">Accurate Electricity Bill<br/>Calculator for India</h1>
            <p className="text-gray-500 text-lg">Instantly calculate your energy charges for 36 States & UTs.</p>
          </div>

          <article className="bg-neuBg rounded-3xl shadow-neu p-6 md:p-8 transition-all duration-300 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">State / UT</label>
                <select className="w-full bg-neuBg shadow-neu-inset rounded-xl px-4 py-4 focus:ring-2 focus:ring-neuGreen font-bold text-neuDark outline-none transition-all duration-300 appearance-none cursor-pointer" value={state} onChange={(e) => setState(e.target.value)}>
                  {statesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Connection</label>
                <select className="w-full bg-neuBg shadow-neu-inset rounded-xl px-4 py-4 focus:ring-2 focus:ring-neuGreen font-bold text-neuDark outline-none transition-all duration-300 appearance-none cursor-pointer" value={connType} onChange={(e) => setConnType(e.target.value)}>
                  <option value="Domestic">🏠 Domestic</option>
                  <option value="Commercial">🏢 Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Units (kWh)</label>
                <input type="number" placeholder="e.g. 250" value={units} onChange={(e) => setUnits(e.target.value)} className="w-full bg-neuBg shadow-neu-inset rounded-xl px-4 py-4 focus:ring-2 focus:ring-neuGreen font-black text-xl text-neuDark outline-none transition-all duration-300" />
              </div>
            </div>

            <div className="mb-8 rounded-2xl overflow-hidden shadow-neu-inset p-1">
              <div className="bg-neuBg px-5 py-4 flex justify-between items-center rounded-xl">
                <span className="text-sm font-bold text-gray-600 flex items-center gap-2"><Settings className="h-4 w-4 text-neuGreen" /> Active Rates ({state})</span>
                <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-bold text-neuGreen bg-neuBg shadow-neu active:shadow-neu-inset px-4 py-2 rounded-lg transition-all duration-300">{isEditing ? 'Save Rates' : 'Edit Rates'}</button>
              </div>
              {!isEditing ? (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm bg-neuBg rounded-b-xl">
                  <div>
                    <p className="text-gray-400 font-bold mb-3 text-xs uppercase tracking-wider">Energy Slabs</p>
                    <ul className="space-y-2 text-gray-600">
                      {tariff.slabs.map((s: any, i: number) => (
                        <li key={i} className="flex justify-between border-b border-[#d1d9d3] pb-1.5"><span>Up to {s.max === Infinity ? 'Above' : s.max} units</span><span className="font-bold text-neuDark">₹{s.rate.toFixed(2)}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold mb-3 text-xs uppercase tracking-wider">Other Charges</p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex justify-between border-b border-[#d1d9d3] pb-1.5"><span>Fixed Charge</span><span className="font-bold text-neuDark">₹{tariff.fixedCharge}</span></li>
                      <li className="flex justify-between border-b border-[#d1d9d3] pb-1.5"><span>Duty Tax</span><span className="font-bold text-neuDark">{tariff.dutyPercent}%</span></li>
                      <li className="flex justify-between border-b border-[#d1d9d3] pb-1.5"><span>FPPCA / Unit</span><span className="font-bold text-neuDark">₹{tariff.fac}</span></li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neuBg rounded-b-xl text-sm">
                   <div><label className="block text-xs font-bold text-gray-500 mb-2">Fixed (₹)</label><input type="number" value={tariff.fixedCharge} onChange={(e) => handleTariffChange(e, 'fixedCharge')} className="w-full bg-neuBg shadow-neu-inset rounded-lg p-3 font-bold text-neuDark outline-none" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 mb-2">Rent (₹)</label><input type="number" value={tariff.meterRent} onChange={(e) => handleTariffChange(e, 'meterRent')} className="w-full bg-neuBg shadow-neu-inset rounded-lg p-3 font-bold text-neuDark outline-none" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 mb-2">Duty (%)</label><input type="number" value={tariff.dutyPercent} onChange={(e) => handleTariffChange(e, 'dutyPercent')} className="w-full bg-neuBg shadow-neu-inset rounded-lg p-3 font-bold text-neuDark outline-none" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 mb-2">FAC (₹)</label><input type="number" value={tariff.fac} onChange={(e) => handleTariffChange(e, 'fac')} className="w-full bg-neuBg shadow-neu-inset rounded-lg p-3 font-bold text-neuDark outline-none" /></div>
                </div>
              )}
            </div>

            <button onClick={calculateBill} className="w-full bg-neuBg text-neuGreen font-black text-lg py-5 rounded-2xl shadow-neu active:shadow-neu-inset transition-all duration-300 flex justify-center items-center gap-2">
              <Zap className="h-5 w-5" /> Generate Bill Receipt
            </button>
          </article>

          {/* RESULTS CARD */}
          {billResult && (
            <div className="bg-neuBg rounded-3xl p-6 md:p-8 shadow-neu border-t-4 border-neuGreen transition-all duration-500 mb-12">
               <div className="text-center mb-8">
                 <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2">Estimated Total Bill</p>
                 <p className="text-6xl font-black text-neuGreen drop-shadow-sm">₹{billResult.finalTotal.toFixed(2)}</p>
                 <p className="text-gray-500 mt-3 text-sm font-medium">For {billResult.consumed} Units in {state} ({connType})</p>
               </div>
               
               <div className="bg-neuBg shadow-neu-inset rounded-2xl p-6 text-sm">
                 <div className="flex justify-between font-black text-neuDark border-b-2 border-[#d1d9d3] pb-4 mb-4 text-lg">
                   <span>Energy Charges</span><span className="text-neuGreen">₹{billResult.totalEnergyCharge.toFixed(2)}</span>
                 </div>
                 {billResult.slabBreakdown.map((b: any, i: number) => (
                   <div key={i} className="flex justify-between text-gray-600 pl-2 mb-3">
                     <span className="font-medium">{b.units} units × ₹{b.rate} <span className="text-xs text-gray-400">({b.range} slab)</span></span>
                     <span className="font-bold text-neuDark">₹{b.cost.toFixed(2)}</span>
                   </div>
                 ))}
                 <div className="pt-5 border-t-2 border-dashed border-[#d1d9d3] space-y-4 mt-5">
                   <div className="flex justify-between text-gray-600 font-medium"><span>Fixed Charges</span><span className="font-bold text-neuDark">₹{billResult.fixedCharge.toFixed(2)}</span></div>
                   {billResult.meterRent > 0 && <div className="flex justify-between text-gray-600 font-medium"><span>Meter Rent</span><span className="font-bold text-neuDark">₹{billResult.meterRent.toFixed(2)}</span></div>}
                   <div className="flex justify-between text-gray-600 font-medium"><span>FPPCA / Surcharge</span><span className="font-bold text-neuDark">₹{billResult.facTotal.toFixed(2)}</span></div>
                   <div className="flex justify-between text-gray-600 font-medium"><span>Electricity Duty</span><span className="font-bold text-neuDark">₹{billResult.dutyTotal.toFixed(2)}</span></div>
                 </div>
               </div>
            </div>
          )}

          {/* HOW TO USE GUIDE */}
          <div className="mt-16">
            <h2 className="text-2xl font-black mb-6 flex items-center justify-center gap-3 text-neuDark">
              <ListOrdered className="text-neuGreen" /> How to Use This Calculator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neuBg shadow-neu p-6 rounded-3xl text-center">
                <div className="bg-neuBg shadow-neu-inset w-12 h-12 mx-auto flex justify-center items-center rounded-full mb-4 text-neuGreen font-black text-xl">1</div>
                <h4 className="font-bold text-neuDark mb-2">Select Your State</h4>
                <p className="text-sm text-gray-500 font-medium">Choose your location to automatically load the latest government tariff slabs.</p>
              </div>
              <div className="bg-neuBg shadow-neu p-6 rounded-3xl text-center">
                <div className="bg-neuBg shadow-neu-inset w-12 h-12 mx-auto flex justify-center items-center rounded-full mb-4 text-neuGreen font-black text-xl">2</div>
                <h4 className="font-bold text-neuDark mb-2">Enter Units (kWh)</h4>
                <p className="text-sm text-gray-500 font-medium">Check your electricity meter or old bill for your total consumed units.</p>
              </div>
              <div className="bg-neuBg shadow-neu p-6 rounded-3xl text-center">
                <div className="bg-neuBg shadow-neu-inset w-12 h-12 mx-auto flex justify-center items-center rounded-full mb-4 text-neuGreen font-black text-xl">3</div>
                <h4 className="font-bold text-neuDark mb-2">Generate Bill</h4>
                <p className="text-sm text-gray-500 font-medium">Click calculate to see a detailed breakdown of fixed charges, taxes, and energy costs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* MIDDLE AD */}
        <AdUnit />

        {/* DATA VISUALIZERS */}
        <section id="compare" className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* State Matchup */}
          <article className="bg-neuBg rounded-3xl p-6 md:p-8 shadow-neu">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-neuDark"><Scale className="text-neuGreen" /> State Matchup</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">Compare the estimated bill for 500 units (Domestic) between two states.</p>
            <div className="flex gap-4 mb-8">
              <select className="w-1/2 bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-sm outline-none cursor-pointer" value={compStateA} onChange={(e)=>setCompStateA(e.target.value)}>
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="w-1/2 bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-sm outline-none cursor-pointer" value={compStateB} onChange={(e)=>setCompStateB(e.target.value)}>
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm font-bold mb-3 text-gray-600"><span>{compStateA}</span><span className="text-neuGreen">₹{Math.round(compA500)}</span></div>
                <div className="w-full bg-neuBg shadow-neu-inset rounded-full h-5 p-1">
                  <div className="bg-neuGreen h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${Math.min((compA500 / Math.max(compA500, compB500)) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-3 text-gray-600"><span>{compStateB}</span><span className="text-neuDark">₹{Math.round(compB500)}</span></div>
                <div className="w-full bg-neuBg shadow-neu-inset rounded-full h-5 p-1">
                  <div className="bg-gray-400 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${Math.min((compB500 / Math.max(compA500, compB500)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </article>

          {/* National Average Visualizer */}
          <article className="bg-neuBg rounded-3xl p-6 md:p-8 shadow-neu flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-black mb-3 flex items-center gap-3 text-neuDark"><BarChart3 className="text-neuGreen" /> National Average</h2>
              <p className="text-sm text-gray-500 mb-6 font-medium">See how a specific state compares to the estimated Indian national average (500 Units).</p>
              <select className="w-full bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-sm outline-none cursor-pointer mb-6" value={natAvgState} onChange={(e)=>setNatAvgState(e.target.value)}>
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end justify-around gap-4 h-40 bg-neuBg shadow-neu-inset rounded-2xl p-4 mt-auto">
              <div className="w-1/3 flex flex-col items-center justify-end gap-3 h-full">
                <span className="font-black text-neuGreen text-lg">₹{Math.round(selectedNatAvgState500)}</span>
                <div className="w-full bg-neuGreen rounded-t-xl transition-all duration-1000 shadow-sm" style={{ height: `${Math.min((selectedNatAvgState500 / 5000) * 100, 100)}%` }}></div>
                <span className="text-xs font-bold text-gray-500 text-center truncate w-full">{natAvgState}</span>
              </div>
              <div className="w-1/3 flex flex-col items-center justify-end gap-3 h-full">
                <span className="font-black text-neuDark text-lg">₹{Math.round(nationalAvg500)}</span>
                <div className="w-full bg-gray-400 rounded-t-xl transition-all duration-1000 shadow-sm" style={{ height: `${(nationalAvg500 / 5000) * 100}%` }}></div>
                <span className="text-xs font-bold text-gray-500 text-center">National Avg</span>
              </div>
            </div>
          </article>
        </section>

        {/* TARIFF DATA & TABLES */}
        <section id="lookup" className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Residential vs Commercial Rates Table */}
          <article className="bg-neuBg rounded-3xl p-6 md:p-8 shadow-neu">
            <h2 className="text-2xl font-black mb-3 flex items-center gap-3 text-neuDark"><TableProperties className="text-neuGreen" /> Rate Comparison</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">Domestic vs Commercial base parameters.</p>
            <select className="w-full bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-sm outline-none cursor-pointer mb-6" value={tableState} onChange={(e)=>setTableState(e.target.value)}>
               {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            
            <div className="bg-neuBg shadow-neu-inset rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-neuBg shadow-neu text-neuDark font-black">
                  <tr>
                    <th className="p-4 rounded-tl-2xl">Charge Type</th>
                    <th className="p-4 text-neuGreen">Domestic</th>
                    <th className="p-4 text-neuGreen rounded-tr-2xl">Commercial</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 font-medium">
                  <tr className="border-b border-[#d1d9d3]">
                    <td className="p-4">Fixed Charge</td>
                    <td className="p-4">₹{defaultTariffData[tableState].Domestic.fixedCharge}</td>
                    <td className="p-4">₹{defaultTariffData[tableState].Commercial.fixedCharge}</td>
                  </tr>
                  <tr className="border-b border-[#d1d9d3]">
                    <td className="p-4">Meter Rent</td>
                    <td className="p-4">₹{defaultTariffData[tableState].Domestic.meterRent}</td>
                    <td className="p-4">₹{defaultTariffData[tableState].Commercial.meterRent}</td>
                  </tr>
                  <tr className="border-b border-[#d1d9d3]">
                    <td className="p-4">Electricity Duty</td>
                    <td className="p-4">{defaultTariffData[tableState].Domestic.dutyPercent}%</td>
                    <td className="p-4">{defaultTariffData[tableState].Commercial.dutyPercent}%</td>
                  </tr>
                  <tr>
                    <td className="p-4">FPPCA (per unit)</td>
                    <td className="p-4">₹{defaultTariffData[tableState].Domestic.fac}</td>
                    <td className="p-4">₹{defaultTariffData[tableState].Commercial.fac}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          {/* State-Wise Electricity Tariff Lookup */}
          <article className="bg-neuBg rounded-3xl p-6 md:p-8 shadow-neu">
            <h2 className="text-2xl font-black mb-3 flex items-center gap-3 text-neuDark"><FileSearch className="text-neuGreen" /> State Tariff Lookup</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">View complete unit slab structures for any state.</p>
            <select className="w-full bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-sm outline-none cursor-pointer mb-6" value={lookupState} onChange={(e)=>setLookupState(e.target.value)}>
               {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neuBg shadow-neu-inset p-4 rounded-2xl">
                <h4 className="font-bold text-neuDark mb-3 border-b-2 border-neuGreen pb-2 inline-block">🏠 Domestic Slabs</h4>
                <ul className="space-y-2 text-sm text-gray-600 font-medium">
                  {defaultTariffData[lookupState].Domestic.slabs.map((s: any, i: number) => (
                    <li key={i} className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-1">
                      <span>Up to {s.max === Infinity ? 'Above' : s.max}</span><span className="font-bold text-neuDark">₹{s.rate.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-neuBg shadow-neu-inset p-4 rounded-2xl">
                <h4 className="font-bold text-neuDark mb-3 border-b-2 border-gray-400 pb-2 inline-block">🏢 Commercial Slabs</h4>
                <ul className="space-y-2 text-sm text-gray-600 font-medium">
                  {defaultTariffData[lookupState].Commercial.slabs.map((s: any, i: number) => (
                    <li key={i} className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-1">
                      <span>Up to {s.max === Infinity ? 'Above' : s.max}</span><span className="font-bold text-neuDark">₹{s.rate.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </section>

        {/* GUIDES & EDUCATIONAL CARDS */}
        {/* ... (Existing code for Guides, Tips, FAQs remains identical to previous response, perfectly integrated into the neumorphic design) ... */}
        
        <section id="guide" className="space-y-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black mb-4 text-neuDark">Understanding Your Bill</h2>
            <p className="text-gray-500 font-medium">Demystifying the charges, surcharges, and terminology used by Indian electricity distribution boards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
             <article className="bg-neuBg shadow-neu rounded-3xl p-8 border border-[#e2e8e4]">
               <h3 className="text-xl font-black mb-5 flex items-center gap-3 text-neuDark"><div className="bg-neuBg shadow-neu p-2 rounded-lg"><Info className="text-neuGreen h-5 w-5"/></div> What is a Billing Slab?</h3>
               <p className="text-gray-600 leading-relaxed text-sm font-medium">
                 India uses a <strong>Telescopic Slab System</strong> to ensure affordability for basic needs while charging premium rates for heavy usage. Instead of a flat rate, units are split into tiers. For example, if you use 150 units, the first 100 units might be billed at ₹3/unit, and only the remaining 50 units fall into the more expensive ₹5/unit slab.
               </p>
             </article>
             <article className="bg-neuBg shadow-neu rounded-3xl p-8 border border-[#e2e8e4]">
               <h3 className="text-xl font-black mb-5 flex items-center gap-3 text-neuDark"><div className="bg-neuBg shadow-neu p-2 rounded-lg"><Info className="text-neuGreen h-5 w-5"/></div> Res vs Commercial Rates</h3>
               <p className="text-gray-600 leading-relaxed text-sm font-medium space-y-3">
                 <span className="flex items-center gap-2"><Home className="h-4 w-4 text-neuGreen"/><strong>Domestic:</strong> Heavily subsidized by the government for residential living.</span>
                 <span className="flex items-start gap-2"><Building2 className="h-4 w-4 text-neuGreen mt-1"/><span><strong>Commercial:</strong> Charged at significantly higher rates. This extra revenue is used to fund the subsidies provided to domestic and agricultural consumers (known as cross-subsidization).</span></span>
               </p>
             </article>
          </div>
        </section>

        {/* 20 FAQs ACCORDION */}
        <section id="faqs" className="max-w-4xl mx-auto pb-8">
          <h2 className="text-3xl font-black mb-10 text-center flex items-center justify-center gap-3 text-neuDark">
            <HelpCircle className="text-neuGreen" /> Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <article key={idx} className="bg-neuBg rounded-3xl shadow-neu overflow-hidden transition-all duration-300">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full px-8 py-6 flex justify-between items-center text-left focus:outline-none">
                  <span className="font-bold text-neuDark text-lg">{faq.q}</span>
                  <div className={`p-2 rounded-full shadow-neu transition-transform duration-300 ${openFaq === idx ? 'rotate-180 shadow-neu-inset bg-neuBg' : 'bg-neuBg'}`}>
                    <ChevronDown className="h-5 w-5 text-neuGreen" />
                  </div>
                </button>
                {openFaq === idx && (
                  <div className="px-8 pb-8 text-gray-600 text-sm leading-relaxed border-t border-[#d1d9d3] pt-5 font-medium">
                    {faq.a}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

      </main>

      {/* BOTTOM AD UNIT & FOOTER */}
      <div className="max-w-7xl mx-auto px-4 mb-16"><AdUnit /></div>
      <footer className="bg-neuBg shadow-[0_-10px_20px_rgba(209,217,211,0.6)] pt-16 pb-8 mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-t-2 border-[#d1d9d3] pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500 font-bold">
            <div className="flex items-center gap-3">
              <div className="bg-neuBg shadow-neu-inset p-2 rounded-lg">
                <Zap className="h-5 w-5 text-neuGreen fill-neuGreen" />
              </div>
              <span className="font-black text-neuDark tracking-widest uppercase text-lg">VidyutCalc</span>
            </div>
            <p>© {new Date().getFullYear()} VidyutCalc India. Designed with Neumorphism.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
