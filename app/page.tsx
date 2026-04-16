'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, ChevronRight, Zap, Lightbulb, BookOpen, ShieldCheck, MapPin, 
  Menu, X, BarChart3, Scale, Info, HelpCircle, ChevronDown, BatteryCharging, 
  Sun, Wind, Home, Building2, TrendingUp, DollarSign
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

export default function ElectricityCalculator() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Calculator State
  const [state, setState] = useState('Maharashtra');
  const [connType, setConnType] = useState('Domestic');
  const [units, setUnits] = useState('');
  const [tariff, setTariff] = useState(defaultTariffData[state][connType]);
  const [isEditing, setIsEditing] = useState(false);
  const [billResult, setBillResult] = useState<any>(null);

  // Compare State
  const [compStateA, setCompStateA] = useState('Maharashtra');
  const [compStateB, setCompStateB] = useState('Delhi');
  
  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Sync Calculator Tariff
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
  const currentState500 = calculateEngine(500, defaultTariffData[state]['Domestic']).finalTotal;
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
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-gray-800 selection:bg-[#6b4c9a] selection:text-white">
      {/* Inject SEO Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-[#6b4c9a] p-1.5 rounded-lg"><Zap className="h-5 w-5 text-yellow-300 fill-yellow-300" /></div>
            <span className="font-black text-xl tracking-tight text-[#5a3e85]">VidyutCalc</span>
          </div>
          <nav className="hidden md:flex gap-6 font-semibold text-sm text-gray-600">
            <a href="#calculator" className="hover:text-[#6b4c9a] transition">Calculator</a>
            <a href="#compare" className="hover:text-[#6b4c9a] transition">Compare States</a>
            <a href="#guide" className="hover:text-[#6b4c9a] transition">Guides</a>
            <a href="#faqs" className="hover:text-[#6b4c9a] transition">FAQs</a>
          </nav>
          <button className="md:hidden text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4 font-semibold text-gray-700 shadow-lg absolute w-full">
            <a href="#calculator" onClick={()=>setIsMenuOpen(false)} className="block">Calculator</a>
            <a href="#compare" onClick={()=>setIsMenuOpen(false)} className="block">Compare States</a>
            <a href="#guide" onClick={()=>setIsMenuOpen(false)} className="block">Guides</a>
            <a href="#faqs" onClick={()=>setIsMenuOpen(false)} className="block">FAQs</a>
          </div>
        )}
      </header>

      {/* HERO & CALCULATOR */}
      <section id="calculator" className="relative">
        <div className="bg-gradient-to-br from-[#6b4c9a] to-[#462b66] pt-16 pb-40 px-4 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Accurate Electricity Bill<br/>Calculator for India</h1>
            <p className="text-purple-100 text-lg max-w-2xl mx-auto mb-8">Instantly calculate your energy charges, fixed costs, and taxes for 36 States & UTs using live telescopic slab data.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State / UT</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#6b4c9a] font-bold text-gray-700 outline-none" value={state} onChange={(e) => setState(e.target.value)}>
                  {statesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Connection</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#6b4c9a] font-bold text-gray-700 outline-none" value={connType} onChange={(e) => setConnType(e.target.value)}>
                  <option value="Domestic">🏠 Domestic</option>
                  <option value="Commercial">🏢 Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Units (kWh)</label>
                <input type="number" placeholder="e.g. 250" value={units} onChange={(e) => setUnits(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#6b4c9a] font-black text-xl text-gray-800 outline-none" />
              </div>
            </div>

            <div className="mb-6 border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-[#f8f9fc] px-4 py-3 flex justify-between items-center border-b border-gray-100">
                <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Settings className="h-4 w-4 text-[#6b4c9a]" /> Active Rates ({state})</span>
                <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-bold text-[#6b4c9a] bg-purple-50 px-3 py-1.5 rounded-md hover:bg-purple-100 transition">{isEditing ? 'Save Rates' : 'Edit Rates'}</button>
              </div>
              {!isEditing ? (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 font-bold mb-2 text-xs uppercase tracking-wider">Energy Slabs</p>
                    <ul className="space-y-1.5 text-gray-600">
                      {tariff.slabs.map((s: any, i: number) => (
                        <li key={i} className="flex justify-between border-b border-gray-50 pb-1"><span>Up to {s.max === Infinity ? 'Above' : s.max} units</span><span className="font-bold text-gray-800">₹{s.rate.toFixed(2)}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold mb-2 text-xs uppercase tracking-wider">Other Charges</p>
                    <ul className="space-y-1.5 text-gray-600">
                      <li className="flex justify-between border-b border-gray-50 pb-1"><span>Fixed Charge</span><span className="font-bold">₹{tariff.fixedCharge}</span></li>
                      <li className="flex justify-between border-b border-gray-50 pb-1"><span>Duty Tax</span><span className="font-bold">{tariff.dutyPercent}%</span></li>
                      <li className="flex justify-between border-b border-gray-50 pb-1"><span>FPPCA / Unit</span><span className="font-bold">₹{tariff.fac}</span></li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white text-sm">
                   <div><label className="block text-xs font-bold text-gray-500 mb-1">Fixed (₹)</label><input type="number" value={tariff.fixedCharge} onChange={(e) => handleTariffChange(e, 'fixedCharge')} className="w-full border rounded p-2 bg-gray-50 font-bold" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 mb-1">Rent (₹)</label><input type="number" value={tariff.meterRent} onChange={(e) => handleTariffChange(e, 'meterRent')} className="w-full border rounded p-2 bg-gray-50 font-bold" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 mb-1">Duty (%)</label><input type="number" value={tariff.dutyPercent} onChange={(e) => handleTariffChange(e, 'dutyPercent')} className="w-full border rounded p-2 bg-gray-50 font-bold" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 mb-1">FAC (₹)</label><input type="number" value={tariff.fac} onChange={(e) => handleTariffChange(e, 'fac')} className="w-full border rounded p-2 bg-gray-50 font-bold" /></div>
                </div>
              )}
            </div>

            <button onClick={calculateBill} className="w-full bg-[#6b4c9a] text-white font-black text-lg py-4 rounded-xl hover:bg-[#5a3e85] transition shadow-lg shadow-purple-200">
              Generate Bill Receipt
            </button>
          </div>

          {/* RESULTS CARD */}
          {billResult && (
            <div className="mt-8 bg-white rounded-2xl p-6 md:p-8 shadow-2xl border-t-8 border-[#6b4c9a] animate-in fade-in slide-in-from-bottom-8">
               <div className="text-center mb-8">
                 <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2">Estimated Total Bill</p>
                 <p className="text-6xl font-black text-gray-800">₹{billResult.finalTotal.toFixed(2)}</p>
                 <p className="text-gray-400 mt-2 text-sm">For {billResult.consumed} Units in {state} ({connType})</p>
               </div>
               
               <div className="bg-gray-50 rounded-xl p-5 text-sm border border-gray-100">
                 <div className="flex justify-between font-black text-gray-800 border-b-2 border-gray-200 pb-3 mb-3 text-lg">
                   <span>Energy Charges</span><span>₹{billResult.totalEnergyCharge.toFixed(2)}</span>
                 </div>
                 {billResult.slabBreakdown.map((b: any, i: number) => (
                   <div key={i} className="flex justify-between text-gray-600 pl-2 mb-2">
                     <span className="font-medium">{b.units} units × ₹{b.rate} <span className="text-xs text-gray-400">({b.range} slab)</span></span><span className="font-bold text-gray-800">₹{b.cost.toFixed(2)}</span>
                   </div>
                 ))}
                 <div className="pt-4 border-t border-dashed border-gray-300 space-y-3 mt-4">
                   <div className="flex justify-between text-gray-600 font-medium"><span>Fixed Charges</span><span className="font-bold text-gray-800">₹{billResult.fixedCharge.toFixed(2)}</span></div>
                   {billResult.meterRent > 0 && <div className="flex justify-between text-gray-600 font-medium"><span>Meter Rent</span><span className="font-bold text-gray-800">₹{billResult.meterRent.toFixed(2)}</span></div>}
                   <div className="flex justify-between text-gray-600 font-medium"><span>FPPCA / Surcharge</span><span className="font-bold text-gray-800">₹{billResult.facTotal.toFixed(2)}</span></div>
                   <div className="flex justify-between text-gray-600 font-medium"><span>Electricity Duty</span><span className="font-bold text-gray-800">₹{billResult.dutyTotal.toFixed(2)}</span></div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        
        {/* DATA VISUALIZERS SECTION */}
        <section id="compare" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Compare Two States Tool */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Scale className="text-[#6b4c9a]" /> State vs State Matchup</h2>
            <p className="text-sm text-gray-500 mb-6">Compare the estimated bill for 500 units (Domestic) between two states.</p>
            <div className="flex gap-4 mb-8">
              <select className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-3 font-bold text-sm" value={compStateA} onChange={(e)=>setCompStateA(e.target.value)}>
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-3 font-bold text-sm" value={compStateB} onChange={(e)=>setCompStateB(e.target.value)}>
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* CSS Bar Chart */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold mb-1"><span>{compStateA}</span><span>₹{Math.round(compA500)}</span></div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div className="bg-[#6b4c9a] h-4 rounded-full transition-all duration-1000" style={{ width: `${Math.min((compA500 / Math.max(compA500, compB500)) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-1"><span>{compStateB}</span><span>₹{Math.round(compB500)}</span></div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div className="bg-gray-400 h-4 rounded-full transition-all duration-1000" style={{ width: `${Math.min((compB500 / Math.max(compA500, compB500)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* National Average Visualizer */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><BarChart3 className="text-[#6b4c9a]" /> National Average</h2>
            <p className="text-sm text-gray-500 mb-8">How your currently selected state ({state}) compares to the estimated Indian national average for 500 units.</p>
            <div className="flex items-end gap-4 h-48 mt-4">
              <div className="w-1/2 flex flex-col items-center justify-end gap-2 h-full">
                <span className="font-black text-gray-700">₹{Math.round(currentState500)}</span>
                <div className="w-20 bg-[#6b4c9a] rounded-t-lg transition-all duration-1000" style={{ height: `${Math.min((currentState500 / 5000) * 100, 100)}%` }}></div>
                <span className="text-xs font-bold text-gray-500 text-center">{state}</span>
              </div>
              <div className="w-1/2 flex flex-col items-center justify-end gap-2 h-full">
                <span className="font-black text-gray-700">₹{Math.round(nationalAvg500)}</span>
                <div className="w-20 bg-gray-300 rounded-t-lg transition-all duration-1000" style={{ height: `${(nationalAvg500 / 5000) * 100}%` }}></div>
                <span className="text-xs font-bold text-gray-500 text-center">National Avg</span>
              </div>
            </div>
          </div>
        </section>

        {/* GUIDES & EDUCATIONAL CARDS */}
        <section id="guide" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black mb-4">Understanding Your Bill</h2>
            <p className="text-gray-500">Demystifying the charges, surcharges, and terminology used by Indian electricity distribution boards.</p>
          </div>

          {/* Slabs & How-to Text Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
             <div className="bg-purple-50 rounded-2xl p-8 border border-purple-100">
               <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Info className="text-[#6b4c9a]"/> What is a Billing Slab?</h3>
               <p className="text-gray-700 leading-relaxed text-sm">
                 India uses a <strong>Telescopic Slab System</strong> to ensure affordability for basic needs while charging premium rates for heavy usage. Instead of a flat rate, units are split into tiers. For example, if you use 150 units, the first 100 units might be billed at ₹3/unit, and only the remaining 50 units fall into the more expensive ₹5/unit slab.
               </p>
             </div>
             <div className="bg-purple-50 rounded-2xl p-8 border border-purple-100">
               <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Info className="text-[#6b4c9a]"/> Res vs Commercial Rates</h3>
               <p className="text-gray-700 leading-relaxed text-sm">
                 <Home className="inline h-4 w-4 mr-1"/><strong>Domestic:</strong> Heavily subsidized by the government for residential living.<br/><br/>
                 <Building2 className="inline h-4 w-4 mr-1"/><strong>Commercial:</strong> Charged at significantly higher rates. This extra revenue is used to fund the subsidies provided to domestic and agricultural consumers (known as cross-subsidization).
               </p>
             </div>
          </div>

          {/* 3 Terminology Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <DollarSign className="h-8 w-8 text-[#6b4c9a] mb-4 bg-purple-50 p-1.5 rounded-lg" />
              <h4 className="font-black text-lg mb-2">Fixed Charges</h4>
              <p className="text-sm text-gray-500 leading-relaxed">A mandatory monthly fee regardless of consumption. It covers the cost of maintaining the power grid, transformers, and the physical wires connecting to your meter. Usually scales with your "Connected Load".</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <TrendingUp className="h-8 w-8 text-[#6b4c9a] mb-4 bg-purple-50 p-1.5 rounded-lg" />
              <h4 className="font-black text-lg mb-2">FPPCA / FAC</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Fuel and Power Purchase Cost Adjustment. Since coal and gas prices fluctuate in the global market, DISCOMs use this dynamic surcharge per unit to recover unexpected fuel costs without altering base tariffs.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <ShieldCheck className="h-8 w-8 text-[#6b4c9a] mb-4 bg-purple-50 p-1.5 rounded-lg" />
              <h4 className="font-black text-lg mb-2">Regulatory Surcharges</h4>
              <p className="text-sm text-gray-500 leading-relaxed">An additional fee sometimes approved by the State Electricity Regulatory Commission (SERC). It allows power companies to recover past financial deficits or fund major state-wide infrastructure upgrades.</p>
            </div>
          </div>
        </section>

        {/* 10 TIPS */}
        <section className="bg-[#fffdf5] rounded-3xl p-8 md:p-12 border border-yellow-100">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Lightbulb className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            <h2 className="text-3xl font-black text-gray-800">10 Proven Energy Saving Tips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {energyTips.map((tip, idx) => (
              <div key={idx} className="flex gap-3 bg-white p-4 rounded-xl shadow-sm border border-yellow-50">
                <span className="bg-yellow-100 text-yellow-700 font-black h-6 w-6 flex items-center justify-center rounded-full shrink-0 text-sm">{idx + 1}</span>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 20 FAQs ACCORDION */}
        <section id="faqs" className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black mb-8 text-center flex items-center justify-center gap-2">
            <HelpCircle className="text-[#6b4c9a]" /> Frequently Asked Questions
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {faqs.map((faq, idx) => (
              <div key={idx} className="group">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition"
                >
                  <span className="font-bold text-gray-800">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed bg-gray-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FOOTER & SEO LINKS */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-[#6b4c9a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-6 text-gray-300">Quick Links: State Bill Calculators</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {statesList.map(s => (
                <a key={s} href="#" onClick={(e) => {e.preventDefault(); setState(s); window.scrollTo({top: 0, behavior: 'smooth'});}} className="text-xs text-gray-400 hover:text-white hover:underline transition">
                  {s} Electricity Bill
                </a>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-white tracking-widest uppercase">VidyutCalc</span>
            </div>
            <p>© {new Date().getFullYear()} VidyutCalc India. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
