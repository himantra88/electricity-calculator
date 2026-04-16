'use client';

import React, { useState, useEffect } from 'react';
import { Settings, ChevronRight, Zap, Lightbulb, BookOpen, ShieldCheck, MapPin } from 'lucide-react';

// --- COMPREHENSIVE STATE LIST (36 States & UTs) ---
const statesList = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// --- GENERATE TARIFF DATA ---
const defaultTariffData: Record<string, any> = {};

// 1. Create a standard fallback tariff for states not in your specific list
const standardDomestic = {
  slabs: [{ max: 100, rate: 3.50 }, { max: 300, rate: 5.50 }, { max: 500, rate: 7.50 }, { max: Infinity, rate: 8.50 }],
  fixedCharge: 50, meterRent: 10, dutyPercent: 5, fac: 0.10
};
const standardCommercial = {
  slabs: [{ max: 200, rate: 7.50 }, { max: Infinity, rate: 9.50 }],
  fixedCharge: 200, meterRent: 20, dutyPercent: 10, fac: 0.20
};

// Apply standard default to all 36 states first
statesList.forEach(state => {
  defaultTariffData[state] = { 
    Domestic: { ...standardDomestic, slabs: [...standardDomestic.slabs] }, 
    Commercial: { ...standardCommercial, slabs: [...standardCommercial.slabs] } 
  };
});

// 2. Inject your specific state data (Mapped to 3-tier slabs: 0-200, 201-500, Above 500)
const stateSpecificRates = {
  "Andhra Pradesh": { low: 3.80, mid: 6.00, high: 8.20 },
  "Assam": { low: 4.20, mid: 6.05, high: 7.90 },
  "Bihar": { low: 3.75, mid: 5.85, high: 8.00 },
  "Delhi": { low: 0.00, mid: 4.50, high: 8.00 }, // 0-200 free tier
  "Gujarat": { low: 3.60, mid: 5.45, high: 7.30 },
  "Haryana": { low: 2.20, mid: 4.65, high: 7.10 },
  "Karnataka": { low: 4.75, mid: 7.10, high: 9.50 },
  "Kerala": { low: 3.80, mid: 6.15, high: 8.50 },
  "Madhya Pradesh": { low: 3.50, mid: 5.65, high: 7.80 },
  "Maharashtra": { low: 4.43, mid: 9.38, high: 14.33 },
  "Odisha": { low: 3.00, mid: 4.90, high: 6.80 },
  "Punjab": { low: 4.10, mid: 5.80, high: 7.50 },
  "Rajasthan": { low: 4.75, mid: 6.35, high: 7.95 },
  "Tamil Nadu": { low: 4.95, mid: 8.00, high: 11.05 },
  "Telangana": { low: 3.60, mid: 5.55, high: 7.50 },
  "Uttar Pradesh": { low: 3.35, mid: 5.65, high: 8.00 },
  "West Bengal": { low: 3.30, mid: 5.90, high: 8.50 }
};

// Apply the specific rates to the data object
Object.entries(stateSpecificRates).forEach(([stateName, rates]) => {
  if (defaultTariffData[stateName]) {
    defaultTariffData[stateName].Domestic.slabs = [
      { max: 200, rate: rates.low },
      { max: 500, rate: rates.mid },
      { max: Infinity, rate: rates.high }
    ];
  }
});

export default function ElectricityCalculator() {
  const [state, setState] = useState('Maharashtra');
  const [connType, setConnType] = useState('Domestic');
  const [units, setUnits] = useState('');
  
  const [tariff, setTariff] = useState(defaultTariffData[state][connType]);
  const [isEditing, setIsEditing] = useState(false);
  const [billResult, setBillResult] = useState<any>(null);

  useEffect(() => {
    setTariff(defaultTariffData[state][connType]);
    setBillResult(null); 
  }, [state, connType]);

  const calculateBill = () => {
    const consumed = parseFloat(units);
    if (isNaN(consumed) || consumed < 0) return alert("Please enter valid units.");

    let remainingUnits = consumed;
    let totalEnergyCharge = 0;
    let prevMax = 0;
    const slabBreakdown = [];

    for (const slab of tariff.slabs) {
      if (remainingUnits <= 0) break;
      
      const slabCapacity = slab.max === Infinity ? Infinity : slab.max - prevMax;
      const unitsInSlab = Math.min(remainingUnits, slabCapacity);
      const cost = unitsInSlab * slab.rate;
      
      totalEnergyCharge += cost;
      slabBreakdown.push({
        range: `${prevMax + 1} - ${slab.max === Infinity ? 'Above' : slab.max}`,
        units: unitsInSlab,
        rate: slab.rate,
        cost: cost
      });

      remainingUnits -= unitsInSlab;
      prevMax = slab.max;
    }

    const facTotal = consumed * tariff.fac;
    const dutyTotal = (totalEnergyCharge + tariff.fixedCharge + facTotal) * (tariff.dutyPercent / 100);
    const finalTotal = totalEnergyCharge + tariff.fixedCharge + tariff.meterRent + facTotal + dutyTotal;

    setBillResult({
      consumed, slabBreakdown, totalEnergyCharge, fixedCharge: tariff.fixedCharge,
      meterRent: tariff.meterRent, facTotal, dutyTotal, finalTotal
    });
  };

  const handleTariffChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setTariff({ ...tariff, [field]: parseFloat(e.target.value) || 0 });
  };

  return (
    <div className="min-h-screen bg-[#f3f4fb] font-sans pb-12">
      
      {/* PURPLE HERO BACKGROUND */}
      <div className="bg-gradient-to-b from-[#6b4c9a] to-[#5a3e85] pt-12 pb-32 px-4 text-center text-white">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="bg-white/20 p-3 rounded-full mb-4">
            <Zap className="h-8 w-8 text-yellow-300 fill-yellow-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Electricity Bill Calculator India</h1>
          <p className="text-purple-100 opacity-90 text-sm md:text-base max-w-xl">
            Select your state, enter your unit consumption, and get an instant breakdown of your electricity charges based on telescopic slabs.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER (Pulled up over the purple background) */}
      <main className="max-w-4xl mx-auto px-4 -mt-24 space-y-8">
        
        {/* 1. CALCULATOR CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State / UT</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6b4c9a] font-medium text-gray-700"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Connection</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6b4c9a] font-medium text-gray-700"
                value={connType}
                onChange={(e) => setConnType(e.target.value)}
              >
                <option value="Domestic">Domestic</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Units (kWh)</label>
              <input
                type="number"
                placeholder="e.g. 250"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6b4c9a] font-bold text-gray-800"
              />
            </div>
          </div>

          {/* Slabs Display inside Calculator */}
          <div className="mb-6 border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-[#f8f9fc] px-4 py-3 flex justify-between items-center border-b border-gray-100">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Settings className="h-4 w-4 text-[#6b4c9a]" /> Active Rates ({state})</span>
              <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-semibold text-[#6b4c9a] bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100 transition">
                {isEditing ? 'Save Rates' : 'Edit Rates'}
              </button>
            </div>
            
            {!isEditing ? (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 font-semibold mb-2 text-xs uppercase">Energy Charges</p>
                  <ul className="space-y-1 text-gray-600">
                    {tariff.slabs.map((s: any, i: number) => (
                      <li key={i} className="flex justify-between border-b border-gray-50 pb-1">
                        <span>Up to {s.max === Infinity ? 'Above' : s.max} units</span>
                        <span className="font-semibold text-gray-800">₹{s.rate.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold mb-2 text-xs uppercase">Fixed & Taxes</p>
                  <ul className="space-y-1 text-gray-600">
                    <li className="flex justify-between border-b border-gray-50 pb-1"><span>Fixed Charge</span><span className="font-semibold">₹{tariff.fixedCharge}</span></li>
                    <li className="flex justify-between border-b border-gray-50 pb-1"><span>Meter Rent</span><span className="font-semibold">₹{tariff.meterRent}</span></li>
                    <li className="flex justify-between border-b border-gray-50 pb-1"><span>Duty Tax</span><span className="font-semibold">{tariff.dutyPercent}%</span></li>
                    <li className="flex justify-between border-b border-gray-50 pb-1"><span>FAC / Unit</span><span className="font-semibold">₹{tariff.fac}</span></li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white text-sm">
                 <div><label className="block text-xs text-gray-500 mb-1">Fixed (₹)</label><input type="number" value={tariff.fixedCharge} onChange={(e) => handleTariffChange(e, 'fixedCharge')} className="w-full border rounded p-2 bg-gray-50" /></div>
                 <div><label className="block text-xs text-gray-500 mb-1">Rent (₹)</label><input type="number" value={tariff.meterRent} onChange={(e) => handleTariffChange(e, 'meterRent')} className="w-full border rounded p-2 bg-gray-50" /></div>
                 <div><label className="block text-xs text-gray-500 mb-1">Duty (%)</label><input type="number" value={tariff.dutyPercent} onChange={(e) => handleTariffChange(e, 'dutyPercent')} className="w-full border rounded p-2 bg-gray-50" /></div>
                 <div><label className="block text-xs text-gray-500 mb-1">FAC (₹)</label><input type="number" value={tariff.fac} onChange={(e) => handleTariffChange(e, 'fac')} className="w-full border rounded p-2 bg-gray-50" /></div>
              </div>
            )}
          </div>

          <button onClick={calculateBill} className="w-full bg-gradient-to-r from-[#6b4c9a] to-[#5a3e85] text-white font-bold text-lg py-4 rounded-xl hover:opacity-90 transition shadow-lg shadow-purple-200 flex justify-center items-center gap-2">
            Calculate Bill
          </button>
        </div>

        {/* 2. RESULTS CARD */}
        {billResult && (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border-t-4 border-[#6b4c9a] animate-in fade-in slide-in-from-bottom-4">
             <div className="text-center mb-6">
               <p className="text-gray-500 font-semibold uppercase tracking-widest text-xs mb-2">Total Estimated Bill</p>
               <p className="text-5xl font-black text-gray-800">₹{billResult.finalTotal.toFixed(2)}</p>
             </div>
             
             <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-3 border border-gray-100">
               <div className="flex justify-between font-bold text-gray-700 border-b border-gray-200 pb-2">
                 <span>Energy Charges ({billResult.consumed} units)</span><span>₹{billResult.totalEnergyCharge.toFixed(2)}</span>
               </div>
               {billResult.slabBreakdown.map((b: any, i: number) => (
                 <div key={i} className="flex justify-between text-gray-600 pl-2">
                   <span>{b.units} units × ₹{b.rate} <span className="text-xs text-gray-400">({b.range})</span></span><span>₹{b.cost.toFixed(2)}</span>
                 </div>
               ))}
               <div className="pt-2 border-t border-gray-200 space-y-2 mt-2">
                 <div className="flex justify-between text-gray-600"><span>Fixed Charges</span><span>₹{billResult.fixedCharge.toFixed(2)}</span></div>
                 {billResult.meterRent > 0 && <div className="flex justify-between text-gray-600"><span>Meter Rent</span><span>₹{billResult.meterRent.toFixed(2)}</span></div>}
                 <div className="flex justify-between text-gray-600"><span>FAC (Fuel Surcharge)</span><span>₹{billResult.facTotal.toFixed(2)}</span></div>
                 <div className="flex justify-between text-gray-600"><span>Electricity Duty ({tariff.dutyPercent}%)</span><span>₹{billResult.dutyTotal.toFixed(2)}</span></div>
               </div>
             </div>
          </div>
        )}

        {/* 3. STATE WISE LINKS GRID */}
        <div>
          <div className="bg-[#6b4c9a] text-white py-3 px-6 rounded-t-2xl font-bold text-center flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5" /> State-Wise Links
          </div>
          <div className="bg-white p-6 rounded-b-2xl shadow-sm border border-t-0 border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {statesList.map(stateName => (
                <button key={stateName} onClick={() => {setState(stateName); window.scrollTo({top: 0, behavior: 'smooth'});}} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#6b4c9a] hover:bg-purple-50 group transition text-left">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-[#6b4c9a]">{stateName}</span>
                    <span className="text-xs text-gray-400">View Rates & Calculator</span>
                  </div>
                  <div className="bg-purple-100 p-1.5 rounded-full text-[#6b4c9a]">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. ENERGY SAVING TIPS */}
        <div>
          <div className="bg-[#6b4c9a] text-white py-3 px-6 rounded-t-2xl font-bold text-center flex items-center justify-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-300" /> Energy Saving Tips
          </div>
          <div className="bg-white p-6 rounded-b-2xl shadow-sm border border-t-0 border-gray-100 bg-[#fffdf5]">
             <ul className="space-y-4">
               <li className="flex items-start gap-3">
                 <div className="bg-yellow-100 p-2 rounded text-yellow-600 mt-1"><Zap className="h-4 w-4" /></div>
                 <div><strong className="text-gray-800 block mb-1">Use LED Bulbs</strong><p className="text-sm text-gray-600">LEDs consume up to 80% less energy than traditional incandescent bulbs and last much longer.</p></div>
               </li>
               <li className="flex items-start gap-3">
                 <div className="bg-yellow-100 p-2 rounded text-yellow-600 mt-1"><Zap className="h-4 w-4" /></div>
                 <div><strong className="text-gray-800 block mb-1">Optimize AC Usage</strong><p className="text-sm text-gray-600">Set your AC to 24°C. Every degree you raise the temperature can save 6% of electricity.</p></div>
               </li>
               <li className="flex items-start gap-3">
                 <div className="bg-yellow-100 p-2 rounded text-yellow-600 mt-1"><Zap className="h-4 w-4" /></div>
                 <div><strong className="text-gray-800 block mb-1">Unplug "Vampire" Appliances</strong><p className="text-sm text-gray-600">Electronics on standby still draw power. Unplug chargers, TVs, and microwaves when not in use.</p></div>
               </li>
             </ul>
          </div>
        </div>

        {/* 5. HOW IT WORKS */}
        <div>
           <div className="bg-[#6b4c9a] text-white py-3 px-6 rounded-t-2xl font-bold text-center flex items-center justify-center gap-2">
            <BookOpen className="h-5 w-5" /> How It Works
          </div>
          <div className="bg-white p-6 rounded-b-2xl shadow-sm border border-t-0 border-gray-100">
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Electricity billing in India uses a <strong>Telescopic Tariff System</strong>. This means you do not pay a flat rate for all units. Instead, consumption is broken into "slabs" to reward lower usage.
            </p>
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <p>For example, if your slabs are (0-100 at ₹4) and (101-200 at ₹6), and you consume 150 units: The first 100 units cost ₹400. The remaining 50 units fall into the next slab and cost ₹300. Your total energy charge is ₹700.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
