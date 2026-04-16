'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, Zap, Lightbulb, ShieldCheck, MapPin, 
  Menu, X, BarChart3, Scale, Info, HelpCircle, ChevronDown, 
  Home, Building2, TrendingUp, DollarSign, ArrowRight
} from 'lucide-react';
import type { TariffData, TariffDetails } from '../lib/statesData';

// --- TYPESCRIPT INTERFACES ---
interface SlabBreakdown {
  range: string;
  units: number;
  rate: number;
  cost: number;
}

interface BillResult {
  consumed: number;
  totalEnergyCharge: number;
  slabBreakdown: SlabBreakdown[];
  finalTotal: number;
  facTotal: number;
  dutyTotal: number;
  fixedCharge: number;
  meterRent: number;
}

interface ElectricityCalculatorProps {
  initialState?: string;
  statesList: string[];
  tariffData: Record<string, TariffData>;
}

// --- STATIC CONTENT ---
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
  { q: "Does the national average rate affect my bill?", a: "No, electricity is a state subject in India. Your bill is strictly based on your specific state's tariff." }
];

// --- CLAYMORPHIC UTILITY CLASSES ---
const clayPanel = "bg-white rounded-[2.5rem] shadow-[12px_12px_24px_#D6D9E6,inset_-4px_-4px_10px_rgba(0,0,0,0.03),inset_4px_4px_10px_rgba(255,255,255,1)]";
const clayPanelColored = (bgColor: string, shadowColor: string) => `bg-[${bgColor}] rounded-[2.5rem] shadow-[12px_12px_24px_#D6D9E6,inset_-4px_-4px_10px_rgba(0,0,0,0.05),inset_4px_4px_10px_rgba(255,255,255,0.7)]`;
const clayInput = "bg-[#F0F2F8] rounded-[1.5rem] shadow-[inset_4px_4px_8px_#D6D9E6,inset_-4px_-4px_8px_#FFFFFF] text-gray-700 outline-none focus:ring-2 focus:ring-[#7B61FF] focus:bg-white transition-all";
const clayBtnPrimary = "bg-[#7B61FF] rounded-[1.5rem] text-white font-bold shadow-[8px_8px_20px_rgba(123,97,255,0.35),inset_-4px_-4px_8px_rgba(0,0,0,0.15),inset_4px_4px_8px_rgba(255,255,255,0.25)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2),inset_-4px_-4px_10px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-200";
const clayBtnSecondary = "bg-white rounded-[1.5rem] text-[#7B61FF] font-bold shadow-[6px_6px_15px_#D6D9E6,inset_-3px_-3px_6px_rgba(0,0,0,0.03),inset_3px_3px_6px_rgba(255,255,255,1)] active:shadow-[inset_3px_3px_8px_#D6D9E6,inset_-3px_-3px_8px_#FFFFFF] active:scale-[0.98] transition-all duration-200";
const clayIcon = "bg-white rounded-[1.2rem] shadow-[5px_5px_10px_#D6D9E6,inset_-2px_-2px_5px_rgba(0,0,0,0.02),inset_2px_2px_5px_rgba(255,255,255,1)] flex items-center justify-center p-3";

// --- REUSABLE WIDGETS ---
const AdUnit = ({ className = `my-8 ${clayInput} p-1` }) => (
  <aside className={`w-full ${className}`}>
    <div className="w-full h-[100px] flex items-center justify-center text-sm font-bold text-[#A0A3B1] uppercase tracking-widest rounded-[1.2rem] border-2 border-dashed border-[#D6D9E6]/50">
      Advertisement Space
    </div>
  </aside>
);

interface StyledSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (string | { val: string; label: string })[];
  className?: string;
}

const StyledSelect: React.FC<StyledSelectProps> = ({ value, onChange, options, className = "" }) => (
  <div className={`relative group ${className}`}>
    <select 
      className={`w-full px-5 py-4 font-extrabold text-[#2D3142] appearance-none cursor-pointer ${clayInput}`}
      value={value} 
      onChange={onChange}
    >
      {options.map((opt) => {
        if (typeof opt === 'string') {
          return <option key={opt} value={opt}>{opt}</option>;
        }
        return <option key={opt.val} value={opt.val}>{opt.label}</option>;
      })}
    </select>
    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
      <ChevronDown className="h-6 w-6 text-[#7B61FF]" />
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function ElectricityCalculator({ 
  initialState = 'Maharashtra', 
  statesList, 
  tariffData 
}: ElectricityCalculatorProps) {
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [state, setState] = useState(initialState);
  const [connType, setConnType] = useState('Domestic');
  const [units, setUnits] = useState('');
  const [tariff, setTariff] = useState<TariffDetails>(
    tariffData[state]?.[connType] || tariffData['Maharashtra']['Domestic']
  );
  const [isEditing, setIsEditing] = useState(false);
  const [billResult, setBillResult] = useState<BillResult | null>(null);

  const [compStateA, setCompStateA] = useState('Maharashtra');
  const [compStateB, setCompStateB] = useState('Delhi');
  const [natAvgState, setNatAvgState] = useState('Maharashtra');
  const [lookupState, setLookupState] = useState('Maharashtra');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (tariffData[state]) {
      setTariff(tariffData[state][connType]);
      setBillResult(null); 
    }
  }, [state, connType, tariffData]);

  const calculateEngine = (calcUnits: number, calcTariff: TariffDetails): Omit<BillResult, 'consumed'> => {
    let remainingUnits = calcUnits;
    let totalEnergyCharge = 0;
    let prevMax = 0;
    const slabBreakdown: SlabBreakdown[] = [];

    for (const slab of calcTariff.slabs) {
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

  const handleTariffChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof TariffDetails) => {
    setTariff({ ...tariff, [field]: parseFloat(e.target.value) || 0 });
  };

  const nationalAvg500 = 3500; 
  const safeData = tariffData || {};
  const fallbackTariff = safeData['Maharashtra']?.Domestic || { slabs: [{ max: Infinity, rate: 7.5 }], fixedCharge: 100, meterRent: 10, dutyPercent: 5, fac: 0.1 };
  
  const selectedNatAvgState500 = calculateEngine(500, safeData[natAvgState]?.Domestic || fallbackTariff).finalTotal;
  const compA500 = calculateEngine(500, safeData[compStateA]?.Domestic || fallbackTariff).finalTotal;
  const compB500 = calculateEngine(500, safeData[compStateB]?.Domestic || fallbackTariff).finalTotal;

  return (
    <div className="min-h-screen bg-[#EAEFF5] font-sans text-[#2D3142] selection:bg-[#7B61FF] selection:text-white pb-20 overflow-x-hidden">

      {/* CLAY HEADER */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className={`h-20 px-6 sm:px-8 flex items-center justify-between ${clayPanel}`}>
          <Link href="/" className="flex items-center gap-4 cursor-pointer group">
            <div className="bg-[#7B61FF] p-2.5 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-[4px_4px_10px_rgba(123,97,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.4)]">
              <Zap className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#2D3142]">Vidyut<span className="text-[#7B61FF]">Calc</span></span>
          </Link>
          <nav className="hidden md:flex gap-8 font-extrabold text-[15px] text-[#8E92A4]">
            <a href="#calculator" className="hover:text-[#7B61FF] transition-colors duration-300">Calculator</a>
            <a href="#compare" className="hover:text-[#7B61FF] transition-colors duration-300">Dashboard</a>
            <a href="#lookup" className="hover:text-[#7B61FF] transition-colors duration-300">Tariffs</a>
          </nav>
          <button className={`md:hidden p-3 ${clayBtnSecondary}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {isMenuOpen && (
          <div className={`md:hidden mt-4 px-6 py-6 space-y-4 font-extrabold text-[#2D3142] w-full z-40 ${clayPanel}`}>
            <a href="#calculator" onClick={()=>setIsMenuOpen(false)} className={`block px-4 py-4 text-center ${clayBtnSecondary}`}>Calculator</a>
            <a href="#compare" onClick={()=>setIsMenuOpen(false)} className={`block px-4 py-4 text-center ${clayBtnSecondary}`}>Dashboard</a>
            <a href="#lookup" onClick={()=>setIsMenuOpen(false)} className={`block px-4 py-4 text-center ${clayBtnSecondary}`}>Tariff Lookup</a>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12 mt-12">

        <div className="flex items-center justify-between mb-2 px-2">
           <div>
             <h1 className="text-4xl font-black text-[#2D3142]">Hello! 👋</h1>
             <p className="text-[#8E92A4] font-bold text-lg mt-2">Let's calculate your electricity bill.</p>
           </div>
           <div className={`${clayIcon} relative h-16 w-16`}>
             <Settings className="h-7 w-7 text-[#A0A3B1] animate-spin-slow" />
             <div className="absolute top-2 right-2 h-3.5 w-3.5 bg-[#FF6188] rounded-full shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8),2px_2px_4px_rgba(255,97,136,0.4)]"></div>
           </div>
        </div>

        {/* CLAY RESULTS CARD (Popping Purple) */}
        {billResult && (
          <div className={`bg-[#7B61FF] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-[15px_15px_35px_rgba(123,97,255,0.4),inset_-5px_-5px_15px_rgba(0,0,0,0.1),inset_5px_5px_15px_rgba(255,255,255,0.25)] animate-in fade-in zoom-in duration-500`}>
             {/* Decorative Clay Bubbles */}
             <div className="absolute -top-16 -right-16 w-52 h-52 bg-white/10 rounded-full shadow-[inset_4px_4px_10px_rgba(255,255,255,0.3)]"></div>
             <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-black/10 rounded-full shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.2)]"></div>
             
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-8">
               <div>
                 <p className="text-white/80 font-bold text-lg mb-2">Estimated Total Bill</p>
                 <h2 className="text-6xl sm:text-7xl font-black tracking-tighter mb-6 drop-shadow-md">₹{billResult.finalTotal.toFixed(2)}</h2>
                 <button onClick={() => window.scrollTo({top: document.getElementById('breakdown')?.offsetTop, behavior: 'smooth'})} className={`${clayBtnSecondary} px-8 py-4 text-[#7B61FF]`}>
                   View Breakdown
                 </button>
               </div>
               
               {/* 3D Circular Progress */}
               <div className="relative w-36 h-36 flex items-center justify-center shrink-0 bg-[#6852D9] rounded-full shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(255,255,255,0.1)]">
                  <svg className="absolute w-[120%] h-[120%] transform -rotate-90 drop-shadow-[2px_4px_6px_rgba(0,0,0,0.2)]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="white" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="60" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center bg-[#7B61FF] w-28 h-28 rounded-full shadow-[8px_8px_16px_rgba(0,0,0,0.2),inset_-2px_-2px_6px_rgba(0,0,0,0.1),inset_2px_2px_6px_rgba(255,255,255,0.2)]">
                    <span className="font-black text-2xl">{billResult.consumed}</span>
                    <span className="text-sm text-white/80 font-bold">Units</span>
                  </div>
               </div>
             </div>
          </div>
        )}

        {/* INPUT FORM (White Clay) */}
        <section id="calculator" className={`${clayPanel} p-8 sm:p-10`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-2xl text-[#2D3142]">Bill Parameters</h3>
            <span className="bg-[#EAF2FF] text-[#4A90E2] text-sm font-extrabold px-4 py-2 rounded-[1rem] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(0,0,0,0.05)]">Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div>
              <label className="block text-sm font-extrabold text-[#8E92A4] mb-3 ml-2">State / UT</label>
              <StyledSelect value={state} onChange={(e) => setState(e.target.value)} options={statesList} />
            </div>
            <div>
              <label className="block text-sm font-extrabold text-[#8E92A4] mb-3 ml-2">Connection</label>
              <StyledSelect 
                value={connType} 
                onChange={(e) => setConnType(e.target.value)} 
                options={[{val: 'Domestic', label: '🏠 Domestic'}, {val: 'Commercial', label: '🏢 Commercial'}]} 
              />
            </div>
            <div>
              <label className="block text-sm font-extrabold text-[#8E92A4] mb-3 ml-2">Units Consumed</label>
              <input 
                type="number" placeholder="e.g. 250" value={units} onChange={(e) => setUnits(e.target.value)} 
                className={`w-full px-5 py-4 font-black text-xl ${clayInput}`} 
              />
            </div>
          </div>

          <div className={`mb-10 rounded-[2rem] overflow-hidden ${clayInput} p-2`}>
            <div className="bg-[#EAEFF5] px-6 py-4 flex justify-between items-center rounded-[1.5rem] shadow-[3px_3px_6px_#D6D9E6,inset_-2px_-2px_4px_#FFFFFF,inset_2px_2px_4px_rgba(255,255,255,0.5)]">
              <span className="text-sm font-extrabold text-[#2D3142] flex items-center gap-3"><div className={clayIcon}><Settings className="h-4 w-4 text-[#7B61FF]" /></div> Active Rates ({state})</span>
              <button onClick={() => setIsEditing(!isEditing)} className={`${clayBtnSecondary} px-4 py-2 text-sm`}>{isEditing ? 'Save Rates' : 'Edit Rates'}</button>
            </div>
            
            <div className="p-6">
              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                  <div className={`${clayPanel} shadow-none bg-white/50 p-5 rounded-[1.5rem]`}>
                    <p className="text-[#8E92A4] font-black mb-4 text-xs uppercase tracking-widest flex items-center gap-2"><Zap className="h-4 w-4 text-[#FFD166]"/> Energy Slabs</p>
                    <ul className="space-y-3 text-[#2D3142] font-bold">
                      {tariff.slabs.map((s: any, i: number) => (
                        <li key={i} className="flex justify-between border-b border-dashed border-[#D6D9E6] pb-2"><span>Up to {s.max === Infinity ? 'Above' : s.max} units</span><span className="text-lg">₹{s.rate.toFixed(2)}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${clayPanel} shadow-none bg-white/50 p-5 rounded-[1.5rem]`}>
                    <p className="text-[#8E92A4] font-black mb-4 text-xs uppercase tracking-widest flex items-center gap-2"><DollarSign className="h-4 w-4 text-[#26C6DA]"/> Other Charges</p>
                    <ul className="space-y-3 text-[#2D3142] font-bold">
                      <li className="flex justify-between border-b border-dashed border-[#D6D9E6] pb-2"><span>Fixed Charge</span><span className="text-lg">₹{tariff.fixedCharge}</span></li>
                      <li className="flex justify-between border-b border-dashed border-[#D6D9E6] pb-2"><span>Duty Tax</span><span className="text-lg">{tariff.dutyPercent}%</span></li>
                      <li className="flex justify-between border-b border-dashed border-[#D6D9E6] pb-2"><span>FPPCA / Unit</span><span className="text-lg">₹{tariff.fac}</span></li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/50 p-5 rounded-[1.5rem]">
                   <div><label className="block text-xs font-black text-[#8E92A4] mb-2">Fixed (₹)</label><input type="number" value={tariff.fixedCharge} onChange={(e) => handleTariffChange(e, 'fixedCharge')} className={`w-full p-3 font-bold ${clayInput}`} /></div>
                   <div><label className="block text-xs font-black text-[#8E92A4] mb-2">Rent (₹)</label><input type="number" value={tariff.meterRent} onChange={(e) => handleTariffChange(e, 'meterRent')} className={`w-full p-3 font-bold ${clayInput}`} /></div>
                   <div><label className="block text-xs font-black text-[#8E92A4] mb-2">Duty (%)</label><input type="number" value={tariff.dutyPercent} onChange={(e) => handleTariffChange(e, 'dutyPercent')} className={`w-full p-3 font-bold ${clayInput}`} /></div>
                   <div><label className="block text-xs font-black text-[#8E92A4] mb-2">FAC (₹)</label><input type="number" value={tariff.fac} onChange={(e) => handleTariffChange(e, 'fac')} className={`w-full p-3 font-bold ${clayInput}`} /></div>
                </div>
              )}
            </div>
          </div>

          <button onClick={calculateBill} className={`w-full py-6 text-xl flex justify-center items-center gap-3 ${clayBtnPrimary}`}>
             Calculate Bill <ArrowRight className="h-6 w-6" />
          </button>
        </section>

        {/* DETAILED BREAKDOWN (Shows after calculation) */}
        {billResult && (
          <div id="breakdown" className={`${clayPanel} p-8 sm:p-10 animate-in slide-in-from-bottom-4`}>
             <h3 className="font-black text-2xl mb-8 text-[#2D3142]">Detailed Breakdown</h3>
             
             <div className="space-y-6">
               <div className={`p-6 bg-[#EAEFF5] rounded-[2rem] shadow-[inset_4px_4px_10px_#D6D9E6,inset_-4px_-4px_10px_#FFFFFF]`}>
                 <div className="flex justify-between font-black text-[#2D3142] mb-5 text-xl border-b-2 border-[#D6D9E6] pb-4">
                   <span className="flex items-center gap-3"><div className={clayIcon}><Zap className="h-5 w-5 text-[#FFD166] fill-[#FFD166]"/></div> Energy Charges</span><span className="text-[#7B61FF] text-2xl">₹{billResult.totalEnergyCharge.toFixed(2)}</span>
                 </div>
                 {billResult.slabBreakdown.map((b, i) => (
                   <div key={i} className="flex justify-between text-[#8E92A4] pl-2 mb-3 text-base font-bold">
                     <span>{b.units} units × ₹{b.rate} <span className="text-xs bg-white px-2 py-1 rounded-lg shadow-sm ml-2">{b.range} slab</span></span>
                     <span className="font-black text-[#2D3142]">₹{b.cost.toFixed(2)}</span>
                   </div>
                 ))}
               </div>

               <div className={`p-6 bg-[#EAEFF5] rounded-[2rem] shadow-[inset_4px_4px_10px_#D6D9E6,inset_-4px_-4px_10px_#FFFFFF] space-y-4 text-base`}>
                 <div className="flex justify-between font-extrabold text-[#8E92A4]"><span>Fixed Charges</span><span className="font-black text-[#2D3142]">₹{billResult.fixedCharge.toFixed(2)}</span></div>
                 {billResult.meterRent > 0 && <div className="flex justify-between font-extrabold text-[#8E92A4]"><span>Meter Rent</span><span className="font-black text-[#2D3142]">₹{billResult.meterRent.toFixed(2)}</span></div>}
                 <div className="flex justify-between font-extrabold text-[#8E92A4]"><span>FPPCA / Surcharge</span><span className="font-black text-[#2D3142]">₹{billResult.facTotal.toFixed(2)}</span></div>
                 <div className="flex justify-between font-extrabold text-[#8E92A4]"><span>Electricity Duty</span><span className="font-black text-[#2D3142]">₹{billResult.dutyTotal.toFixed(2)}</span></div>
               </div>
             </div>
          </div>
        )}

        {/* DASHBOARD SECTION */}
        <div className="pt-8">
          <h2 className="text-3xl font-black text-[#2D3142] mb-8 flex items-center">Dashboard <span className="bg-[#F0E6FF] text-[#7B61FF] text-base font-black px-4 py-1 rounded-xl shadow-[inset_2px_2px_4px_#FFFFFF,inset_-2px_-2px_4px_rgba(123,97,255,0.2)] ml-4">2 Widgets</span></h2>
          
          <section id="compare" className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            {/* Soft Blue Clay Card */}
            <article className={`p-8 bg-[#EAF2FF] rounded-[2.5rem] shadow-[12px_12px_24px_#D6D9E6,inset_-4px_-4px_10px_rgba(74,144,226,0.1),inset_4px_4px_10px_rgba(255,255,255,0.8)]`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[#4A90E2] font-black text-xs uppercase tracking-widest mb-2">Comparison</p>
                  <h3 className="font-black text-[#2D3142] text-2xl leading-tight">State vs State<br/>Matchup</h3>
                </div>
                <div className={`${clayIcon} bg-[#EAF2FF] shadow-[4px_4px_8px_#D0DEED,inset_-2px_-2px_4px_rgba(255,255,255,0.5),inset_2px_2px_4px_#FFFFFF]`}>
                  <Scale className="h-6 w-6 text-[#4A90E2]" />
                </div>
              </div>
              
              <div className="flex gap-4 mb-8">
                <StyledSelect className="w-1/2" value={compStateA} onChange={(e)=>setCompStateA(e.target.value)} options={statesList} />
                <StyledSelect className="w-1/2" value={compStateB} onChange={(e)=>setCompStateB(e.target.value)} options={statesList} />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-base font-black text-[#2D3142] mb-2"><span className="truncate pr-2">{compStateA}</span><span>₹{Math.round(compA500)}</span></div>
                  <div className="w-full bg-[#D0DEED] rounded-full h-4 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_#FFFFFF]">
                    <div className="bg-[#4A90E2] h-4 rounded-full transition-all duration-1000 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.4)]" style={{ width: `${Math.min((compA500 / Math.max(compA500, compB500)) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-base font-black text-[#2D3142] mb-2"><span className="truncate pr-2">{compStateB}</span><span>₹{Math.round(compB500)}</span></div>
                  <div className="w-full bg-[#D0DEED] rounded-full h-4 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_#FFFFFF]">
                    <div className="bg-[#A0A3B1] h-4 rounded-full transition-all duration-1000 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.4)]" style={{ width: `${Math.min((compB500 / Math.max(compA500, compB500)) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </article>

            {/* Soft Peach Clay Card */}
            <article className={`p-8 bg-[#FFEFE5] rounded-[2.5rem] shadow-[12px_12px_24px_#D6D9E6,inset_-4px_-4px_10px_rgba(255,115,73,0.08),inset_4px_4px_10px_rgba(255,255,255,0.8)]`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[#FF7349] font-black text-xs uppercase tracking-widest mb-2">Metrics</p>
                  <h3 className="font-black text-[#2D3142] text-2xl leading-tight">National<br/>Average</h3>
                </div>
                <div className={`${clayIcon} bg-[#FFEFE5] shadow-[4px_4px_8px_#EEDDCA,inset_-2px_-2px_4px_rgba(255,255,255,0.5),inset_2px_2px_4px_#FFFFFF]`}>
                  <BarChart3 className="h-6 w-6 text-[#FF7349]" />
                </div>
              </div>

              <div className="mb-10">
                <StyledSelect value={natAvgState} onChange={(e)=>setNatAvgState(e.target.value)} options={statesList} />
              </div>

              <div className="flex items-end justify-around gap-6 h-32">
                <div className="w-1/2 flex flex-col items-center justify-end gap-3 h-full">
                  <span className="font-black text-2xl text-[#2D3142]">₹{Math.round(selectedNatAvgState500)}</span>
                  <div className="w-16 bg-[#FF7349] rounded-[1rem] rounded-b-none transition-all duration-1000 shadow-[inset_-2px_0px_6px_rgba(0,0,0,0.2),inset_2px_2px_6px_rgba(255,255,255,0.3)]" style={{ height: `${Math.min((selectedNatAvgState500 / 5000) * 100, 100)}%` }}></div>
                  <span className="text-xs font-black text-[#8E92A4] text-center bg-white px-3 py-1 rounded-lg shadow-sm truncate w-full">{natAvgState}</span>
                </div>
                <div className="w-1/2 flex flex-col items-center justify-end gap-3 h-full">
                  <span className="font-black text-2xl text-[#2D3142]">₹{Math.round(nationalAvg500)}</span>
                  <div className="w-16 bg-[#A0A3B1] rounded-[1rem] rounded-b-none transition-all duration-1000 shadow-[inset_-2px_0px_6px_rgba(0,0,0,0.2),inset_2px_2px_6px_rgba(255,255,255,0.3)]" style={{ height: `${(nationalAvg500 / 5000) * 100}%` }}></div>
                  <span className="text-xs font-black text-[#8E92A4] text-center bg-white px-3 py-1 rounded-lg shadow-sm">Nat Avg</span>
                </div>
              </div>
            </article>

          </section>
        </div>

        <AdUnit />

        {/* TARIFF LIST SECTION */}
        <div className="pt-8">
          <h2 className="text-3xl font-black text-[#2D3142] mb-8 flex items-center">Tariff Lookup <span className="bg-[#EAF2FF] text-[#4A90E2] text-base font-black px-4 py-1 rounded-xl shadow-[inset_2px_2px_4px_#FFFFFF,inset_-2px_-2px_4px_rgba(74,144,226,0.15)] ml-4">Select State</span></h2>
          
          <div className="space-y-8">
            
            {/* Clay Pill Container */}
            <div className={`${clayPanel} p-8`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-5 w-full sm:w-auto">
                  <div className={`${clayIcon} h-16 w-16 shrink-0`}>
                    <Home className="h-8 w-8 text-[#FF6188]" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#2D3142] text-2xl">Domestic Slabs</h4>
                    <p className="text-[#8E92A4] font-extrabold text-sm">Select state below to view</p>
                  </div>
                </div>
                
                <div className="w-full sm:w-72 shrink-0">
                   <StyledSelect value={lookupState} onChange={(e)=>setLookupState(e.target.value)} options={statesList} />
                </div>
              </div>

              <div className={`p-6 ${clayInput}`}>
                <ul className="space-y-4 text-base text-[#8E92A4] font-bold">
                  {tariffData[lookupState]?.Domestic?.slabs?.map((s, i) => (
                    <li key={i} className="flex justify-between border-b border-dashed border-[#D6D9E6] pb-3">
                      <span>Up to {s.max === Infinity ? 'Above' : s.max} units</span><span className="font-black text-xl text-[#2D3142]">₹{s.rate.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Clay Pill Container 2 */}
            <div className={`${clayPanel} p-8`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-5 w-full sm:w-auto">
                  <div className={`${clayIcon} h-16 w-16 shrink-0`}>
                    <Building2 className="h-8 w-8 text-[#26C6DA]" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#2D3142] text-2xl">Commercial Slabs</h4>
                    <p className="text-[#8E92A4] font-extrabold text-sm">Higher rates for cross-subsidization</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 ${clayInput}`}>
                <ul className="space-y-4 text-base text-[#8E92A4] font-bold">
                  {tariffData[lookupState]?.Commercial?.slabs?.map((s, i) => (
                    <li key={i} className="flex justify-between border-b border-dashed border-[#D6D9E6] pb-3">
                      <span>Up to {s.max === Infinity ? 'Above' : s.max} units</span><span className="font-black text-xl text-[#2D3142]">₹{s.rate.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* FAQs (Clay Bubbles) */}
        <div className="pt-12">
          <h2 className="text-3xl font-black text-[#2D3142] mb-8 flex items-center">Learning <span className="bg-[#FFF0E7] text-[#FF7349] text-base font-black px-4 py-1 rounded-xl shadow-[inset_2px_2px_4px_#FFFFFF,inset_-2px_-2px_4px_rgba(255,115,73,0.15)] ml-4">Tips</span></h2>
          
          <div className="space-y-6">
            {faqs.slice(0, 6).map((faq, idx) => (
              <article key={idx} className={`${clayPanel} p-2 overflow-hidden transition-all duration-300`}>
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                  className="w-full p-5 flex justify-between items-center text-left bg-white rounded-[2rem] hover:bg-[#FAFAFD] transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <div className={`${clayIcon} shrink-0 h-14 w-14`}>
                      <Lightbulb className={`h-6 w-6 transition-colors ${openFaq === idx ? 'text-[#FFD166] fill-[#FFD166]' : 'text-[#A0A3B1]'}`} />
                    </div>
                    <span className="font-black text-[#2D3142] text-lg pr-4">{faq.q}</span>
                  </div>
                  
                  {/* Clay Toggle Button */}
                  <div className={`relative w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 transition-all ${openFaq === idx ? clayInput : clayIcon}`}>
                    <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-[#7B61FF]' : 'text-[#A0A3B1]'}`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-8 pb-8 pt-4 ml-[4.5rem] text-[#8E92A4] text-base leading-relaxed font-bold">
                    {faq.a}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

      </main>

      {/* CLAY FOOTER */}
      <footer className="mt-24 pt-20 pb-12 bg-[#EAEFF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`${clayPanel} p-10 mb-12`}>
            <h3 className="text-2xl font-black mb-10 text-[#2D3142] flex items-center gap-4">
              <div className={`${clayIcon} h-12 w-12`}><MapPin className="text-[#FF6188] h-6 w-6" /></div> 
              State Calculators
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {statesList.map(s => (
                <Link 
                  key={s} 
                  href={`/calculator/${s.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                  className={`${clayBtnSecondary} flex items-center justify-center h-14 w-full text-xs sm:text-sm text-[#8E92A4] font-black px-4 hover:text-[#7B61FF] text-center`}
                >
                  <span className="truncate">{s}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[15px] text-[#A0A3B1] font-bold px-4">
            <div className="flex items-center gap-4">
              <div className={`${clayIcon} h-12 w-12 bg-[#7B61FF] shadow-[5px_5px_10px_#D6D9E6,inset_-2px_-2px_5px_rgba(0,0,0,0.2),inset_2px_2px_5px_rgba(255,255,255,0.3)]`}>
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="font-black text-[#2D3142] tracking-widest uppercase text-xl">VidyutCalc</span>
            </div>
            
            <p className="text-center md:text-left">© {new Date().getFullYear()} VidyutCalc India.</p>
            
            <div className="flex gap-8">
              <Link href="#" className="hover:text-[#7B61FF] transition">Privacy</Link>
              <Link href="#" className="hover:text-[#7B61FF] transition">Terms</Link>
              <Link href="#" className="hover:text-[#7B61FF] transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
