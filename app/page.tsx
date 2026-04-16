'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Calculator, ChevronDown, Zap, Lightbulb, Moon, Globe, CheckCircle2 } from 'lucide-react';

// --- MOCK DATA ---
const defaultTariffData = {
  Maharashtra: {
    Domestic: {
      slabs: [
        { max: 100, rate: 5.36 },
        { max: 300, rate: 9.38 },
        { max: 500, rate: 13.25 },
        { max: Infinity, rate: 14.85 }
      ],
      fixedCharge: 115, meterRent: 0, dutyPercent: 16, fac: 0.15
    },
    Commercial: {
      slabs: [
        { max: 200, rate: 7.36 },
        { max: Infinity, rate: 11.38 }
      ],
      fixedCharge: 400, meterRent: 20, dutyPercent: 21, fac: 0.25
    }
  },
  Delhi: {
    Domestic: {
      slabs: [
        { max: 200, rate: 3.00 },
        { max: 400, rate: 4.50 },
        { max: 800, rate: 6.50 },
        { max: Infinity, rate: 7.00 }
      ],
      fixedCharge: 40, meterRent: 0, dutyPercent: 5, fac: 0.00
    },
    Commercial: {
      slabs: [
        { max: Infinity, rate: 8.50 }
      ],
      fixedCharge: 250, meterRent: 0, dutyPercent: 5, fac: 0.00
    }
  },
  Karnataka: {
    Domestic: {
      slabs: [
        { max: 100, rate: 4.75 },
        { max: 200, rate: 7.00 },
        { max: Infinity, rate: 8.20 }
      ],
      fixedCharge: 100, meterRent: 0, dutyPercent: 9, fac: 0.10
    },
    Commercial: {
      slabs: [
        { max: 50, rate: 8.50 },
        { max: Infinity, rate: 9.50 }
      ],
      fixedCharge: 150, meterRent: 15, dutyPercent: 9, fac: 0.15
    }
  }
};

export default function ElectricityCalculator() {
  const [state, setState] = useState('Maharashtra');
  const [connType, setConnType] = useState('Domestic');
  const [units, setUnits] = useState('');
  
  const [tariff, setTariff] = useState(defaultTariffData[state as keyof typeof defaultTariffData][connType as 'Domestic' | 'Commercial']);
  const [isEditing, setIsEditing] = useState(false);
  const [billResult, setBillResult] = useState<any>(null);

  useEffect(() => {
    setTariff(defaultTariffData[state as keyof typeof defaultTariffData][connType as 'Domestic' | 'Commercial']);
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
      consumed,
      slabBreakdown,
      totalEnergyCharge,
      fixedCharge: tariff.fixedCharge,
      meterRent: tariff.meterRent,
      facTotal,
      dutyTotal,
      finalTotal
    });
  };

  const handleTariffChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setTariff({ ...tariff, [field]: parseFloat(e.target.value) || 0 });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Zap className="h-6 w-6 fill-current" />
            <span className="font-bold text-xl tracking-tight">VidyutCalc.in</span>
          </div>
          <nav className="hidden md:flex gap-6 font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition">Calculators</a>
            <a href="#" className="hover:text-indigo-600 transition">Guides</a>
            <a href="#" className="hover:text-indigo-600 transition">State Rates</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-indigo-500" />
              Electricity Bill Calculator
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Select State</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    {Object.keys(defaultTariffData).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Connection Type</label>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  {['Domestic', 'Commercial'].map(type => (
                    <button
                      key={type}
                      onClick={() => setConnType(type)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition ${connType === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-600 mb-2">Units Consumed (kWh)</label>
              <input
                type="number"
                placeholder="e.g. 250"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full text-2xl font-bold bg-slate-50 border border-slate-200 rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-6 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-700">Active Tariff Slabs</span>
                <button onClick={() => setIsEditing(!isEditing)} className="text-xs flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800">
                  <Settings className="h-3 w-3" /> Edit Rates
                </button>
              </div>
              
              {!isEditing ? (
                 <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <p className="text-slate-500 mb-1">Energy Charges:</p>
                     <ul className="space-y-1 font-medium">
                       {tariff.slabs.map((s, i) => (
                         <li key={i}>Up to {s.max === Infinity ? 'Above' : s.max} units: ₹{s.rate.toFixed(2)}</li>
                       ))}
                     </ul>
                   </div>
                   <div>
                     <p className="text-slate-500 mb-1">Other Charges:</p>
                     <ul className="space-y-1 font-medium">
                       <li>Fixed: ₹{tariff.fixedCharge}</li>
                       <li>Duty: {tariff.dutyPercent}%</li>
                       <li>FAC: ₹{tariff.fac}/unit</li>
                     </ul>
                   </div>
                 </div>
              ) : (
                <div className="p-4 grid grid-cols-2 gap-4 text-sm bg-white">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Fixed Charge (₹)</label>
                    <input type="number" value={tariff.fixedCharge} onChange={(e) => handleTariffChange(e, 'fixedCharge')} className="w-full border rounded p-1" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Electricity Duty (%)</label>
                    <input type="number" value={tariff.dutyPercent} onChange={(e) => handleTariffChange(e, 'dutyPercent')} className="w-full border rounded p-1" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">FAC per Unit (₹)</label>
                    <input type="number" value={tariff.fac} onChange={(e) => handleTariffChange(e, 'fac')} className="w-full border rounded p-1" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Meter Rent (₹)</label>
                    <input type="number" value={tariff.meterRent} onChange={(e) => handleTariffChange(e, 'meterRent')} className="w-full border rounded p-1" />
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={calculateBill}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-xl transition shadow-lg shadow-indigo-200"
            >
              Calculate Bill
            </button>
          </div>

          {billResult && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-indigo-100">
              <div className="text-center mb-6 border-b border-dashed border-slate-300 pb-6">
                <p className="text-slate-500 font-medium mb-1">Estimated Bill for {billResult.consumed} Units</p>
                <p className="text-5xl font-black text-slate-800">₹{billResult.finalTotal.toFixed(2)}</p>
              </div>

              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between font-bold text-slate-700 border-b pb-2">
                  <span>Energy Charges Breakdown</span>
                  <span>₹{billResult.totalEnergyCharge.toFixed(2)}</span>
                </div>
                {billResult.slabBreakdown.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between text-slate-600 pl-2">
                    <span>{b.units} units × ₹{b.rate} ({b.range})</span>
                    <span>₹{b.cost.toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="pt-4 space-y-3 border-t border-dashed border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Fixed Charges</span>
                    <span>₹{billResult.fixedCharge.toFixed(2)}</span>
                  </div>
                  {billResult.meterRent > 0 && (
                     <div className="flex justify-between text-slate-600">
                     <span>Meter Rent</span>
                     <span>₹{billResult.meterRent.toFixed(2)}</span>
                   </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>FAC ({billResult.consumed} units × ₹{tariff.fac})</span>
                    <span>₹{billResult.facTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Electricity Duty ({tariff.dutyPercent}%)</span>
                    <span>₹{billResult.dutyTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 text-indigo-800 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">This is an estimated calculation based on standard state tariffs.</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-sm">
            <h3 className="font-bold text-lg mb-3">How this Calculator Works</h3>
            <p className="text-slate-600 mb-5 leading-relaxed">Our logic uses "Telescopic Billing". This means your total units are split into slabs. The first few units are charged at a lower rate, and subsequent units fall into higher-priced brackets, ensuring fair pricing for basic usage.</p>
          </div>
        </div>
      </main>
    </div>
  );
}