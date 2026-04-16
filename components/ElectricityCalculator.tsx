'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, Zap, Lightbulb, ShieldCheck, MapPin, 
  Menu, X, BarChart3, Scale, Info, HelpCircle, ChevronDown, 
  Home, Building2, TrendingUp, DollarSign, ListOrdered, FileSearch, TableProperties, ArrowRight
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

// --- REUSABLE WIDGETS ---
const AdUnit = ({ className = "my-6 rounded-[2rem] overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F1F5]" }) => (
  <aside className={`w-full ${className}`}>
    <div className="adsbygoogle-placeholder w-full h-[100px] flex items-center justify-center text-sm font-bold text-[#A0A3B1] uppercase tracking-widest">
      Advertisement Space
    </div>
  </aside>
);

interface StyledSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (string | { val: string; label: string })[];
  className?: string;
  bgClass?: string;
}

const StyledSelect: React.FC<StyledSelectProps> = ({ value, onChange, options, className = "", bgClass = "bg-white" }) => (
  <div className={`relative group ${className}`}>
    <select 
      className={`w-full ${bgClass} rounded-2xl px-5 py-4 font-bold text-[#1B1D28] border border-[#F0F1F5] shadow-[0_2px_10px_rgba(0,0,0,0.02)] outline-none focus:ring-2 focus:ring-[#613EEA] focus:border-transparent transition-all duration-300 appearance-none cursor-pointer`}
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
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
      <ChevronDown className="h-5 w-5 text-[#A0A3B1]" />
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
  const [tableState, setTableState] = useState('Maharashtra');
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
    <div className="min-h-screen bg-[#FAFAFD] font-sans text-[#1B1D28] selection:bg-[#613EEA] selection:text-white overflow-x-hidden pb-20">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#FAFAFD]/90 backdrop-blur-md mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="bg-[#613EEA] p-2.5 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-md shadow-[#613EEA]/30">
              <Zap className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#1B1D28]">Vidyut<span className="text-[#613EEA]">Calc</span></span>
          </Link>
          <nav className="hidden md:flex gap-8 font-bold text-[15px] text-[#A0A3B1]">
            <a href="#calculator" className="hover:text-[#613EEA] transition-colors duration-300">Calculator</a>
            <a href="#compare" className="hover:text-[#613EEA] transition-colors duration-300">Dashboard</a>
            <a href="#lookup" className="hover:text-[#613EEA] transition-colors duration-300">Tariffs</a>
          </nav>
          <button className="md:hidden text-[#1B1D28] bg-white shadow-sm p-2.5 rounded-xl border border-[#F0F1F5]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] px-6 py-6 space-y-4 font-bold text-[#1B1D28] absolute w-full z-40 border-t border-[#F0F1F5]">
            <a href="#calculator" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-3 bg-[#FAFAFD] rounded-xl text-center">Calculator</a>
            <a href="#compare" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-3 bg-[#FAFAFD] rounded-xl text-center">Dashboard</a>
            <a href="#lookup" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-3 bg-[#FAFAFD] rounded-xl text-center">Tariff Lookup</a>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        <div className="flex items-center justify-between mb-4">
           <div>
             <h1 className="text-3xl font-extrabold text-[#1B1D28]">Hello!</h1>
             <p className="text-[#A0A3B1] font-medium text-lg mt-1">Let's calculate your electricity bill.</p>
           </div>
           <div className="bg-white p-3 rounded-full shadow-sm border border-[#F0F1F5] relative">
             <Settings className="h-6 w-6 text-[#A0A3B1]" />
             <div className="absolute top-2 right-2 h-2.5 w-2.5 bg-[#613EEA] rounded-full border-2 border-white"></div>
           </div>
        </div>

        {/* RESULTS CARD (Vibrant Purple - Matches "Your today's task" card) */}
        {billResult && (
          <div className="bg-[#613EEA] rounded-[2rem] p-8 shadow-[0_15px_40px_rgba(97,62,234,0.3)] text-white relative overflow-hidden animate-in fade-in zoom-in duration-500">
             {/* Decorative Circles */}
             <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
             
             <div className="flex justify-between items-start relative z-10">
               <div>
                 <p className="text-white/80 font-medium text-lg mb-1">Estimated Total Bill</p>
                 <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6">₹{billResult.finalTotal.toFixed(2)}</h2>
                 <button onClick={() => window.scrollTo({top: document.getElementById('breakdown')?.offsetTop, behavior: 'smooth'})} className="bg-white text-[#613EEA] font-bold px-6 py-3 rounded-xl shadow-md hover:bg-gray-50 transition-colors">
                   View Breakdown
                 </button>
               </div>
               
               {/* Circular Progress Ring matching the image */}
               <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="white" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="60" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-extrabold text-xl">{billResult.consumed}</span>
                    <span className="text-xs text-white/80">Units</span>
                  </div>
               </div>
             </div>
             
             <div className="absolute top-6 right-6 bg-white/20 p-2 rounded-xl backdrop-blur-sm cursor-pointer">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
             </div>
          </div>
        )}

        {/* INPUT FORM (Clean White Card) */}
        <section id="calculator" className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F1F5]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-xl">Bill Parameters</h3>
            <span className="bg-[#EDF4FF] text-[#1678FF] text-xs font-bold px-3 py-1 rounded-full">Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-sm font-bold text-[#9798A3] mb-2 pl-1">State / UT</label>
              <StyledSelect bgClass="bg-[#FAFAFD]" value={state} onChange={(e) => setState(e.target.value)} options={statesList} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#9798A3] mb-2 pl-1">Connection</label>
              <StyledSelect 
                bgClass="bg-[#FAFAFD]"
                value={connType} 
                onChange={(e) => setConnType(e.target.value)} 
                options={[{val: 'Domestic', label: '🏠 Domestic'}, {val: 'Commercial', label: '🏢 Commercial'}]} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#9798A3] mb-2 pl-1">Units Consumed</label>
              <input 
                type="number" placeholder="e.g. 250" value={units} onChange={(e) => setUnits(e.target.value)} 
                className="w-full bg-[#FAFAFD] border border-[#F0F1F5] shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl px-5 py-4 font-extrabold text-xl text-[#1B1D28] outline-none focus:ring-2 focus:ring-[#613EEA] focus:border-transparent transition-all" 
              />
            </div>
          </div>

          <button onClick={calculateBill} className="w-full bg-[#FAFAFD] text-[#1B1D28] font-bold text-lg py-5 rounded-2xl border border-[#F0F1F5] hover:bg-[#613EEA] hover:text-white hover:border-[#613EEA] transition-colors duration-300 flex justify-center items-center gap-3">
             Calculate Bill <ArrowRight className="h-5 w-5" />
          </button>
        </section>

        {/* DETAILED BREAKDOWN (Shows after calculation) */}
        {billResult && (
          <div id="breakdown" className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F1F5] animate-in slide-in-from-bottom-4">
             <h3 className="font-extrabold text-xl mb-6">Detailed Breakdown</h3>
             
             <div className="space-y-4">
               <div className="bg-[#FAFAFD] rounded-2xl p-5 border border-[#F0F1F5]">
                 <div className="flex justify-between font-black text-[#1B1D28] mb-3 text-lg">
                   <span className="flex items-center gap-2">Energy Charges</span><span className="text-[#613EEA]">₹{billResult.totalEnergyCharge.toFixed(2)}</span>
                 </div>
                 {billResult.slabBreakdown.map((b, i) => (
                   <div key={i} className="flex justify-between text-[#8E92A4] pl-2 mb-2 text-sm font-medium">
                     <span>{b.units} units × ₹{b.rate} <span className="text-xs opacity-70">({b.range} slab)</span></span>
                     <span className="font-bold text-[#1B1D28]">₹{b.cost.toFixed(2)}</span>
                   </div>
                 ))}
               </div>

               <div className="bg-[#FAFAFD] rounded-2xl p-5 border border-[#F0F1F5] space-y-3 text-sm">
                 <div className="flex justify-between font-medium text-[#8E92A4]"><span>Fixed Charges</span><span className="font-bold text-[#1B1D28]">₹{billResult.fixedCharge.toFixed(2)}</span></div>
                 {billResult.meterRent > 0 && <div className="flex justify-between font-medium text-[#8E92A4]"><span>Meter Rent</span><span className="font-bold text-[#1B1D28]">₹{billResult.meterRent.toFixed(2)}</span></div>}
                 <div className="flex justify-between font-medium text-[#8E92A4]"><span>FPPCA / Surcharge</span><span className="font-bold text-[#1B1D28]">₹{billResult.facTotal.toFixed(2)}</span></div>
                 <div className="flex justify-between font-medium text-[#8E92A4]"><span>Electricity Duty</span><span className="font-bold text-[#1B1D28]">₹{billResult.dutyTotal.toFixed(2)}</span></div>
               </div>
             </div>
          </div>
        )}

        {/* DASHBOARD SECTION (Matches "In Progress") */}
        <div className="pt-4">
          <h2 className="text-2xl font-extrabold text-[#1B1D28] mb-6">Dashboard <span className="bg-[#F6E8FE] text-[#613EEA] text-sm px-2 py-0.5 rounded-full ml-2">2</span></h2>
          
          <section id="compare" className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Soft Blue Card */}
            <article className="bg-[#EDF4FF] rounded-[2rem] p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[#8E92A4] font-bold text-xs uppercase tracking-wider mb-1">Comparison</p>
                  <h3 className="font-extrabold text-[#1B1D28] text-lg leading-tight">State vs State<br/>Matchup</h3>
                </div>
                <div className="bg-[#FFE2ED] p-2.5 rounded-xl">
                  <Scale className="h-5 w-5 text-[#FF6D9B]" />
                </div>
              </div>
              
              <div className="flex gap-2 mb-6">
                <StyledSelect bgClass="bg-white/60" className="w-1/2" value={compStateA} onChange={(e)=>setCompStateA(e.target.value)} options={statesList} />
                <StyledSelect bgClass="bg-white/60" className="w-1/2" value={compStateB} onChange={(e)=>setCompStateB(e.target.value)} options={statesList} />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-bold text-[#1B1D28] mb-1.5"><span className="truncate pr-2">{compStateA}</span><span>₹{Math.round(compA500)}</span></div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-[#1678FF] h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min((compA500 / Math.max(compA500, compB500)) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold text-[#1B1D28] mb-1.5"><span className="truncate pr-2">{compStateB}</span><span>₹{Math.round(compB500)}</span></div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-[#A0A3B1] h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min((compB500 / Math.max(compA500, compB500)) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </article>

            {/* Soft Peach Card */}
            <article className="bg-[#FFF0E7] rounded-[2rem] p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[#8E92A4] font-bold text-xs uppercase tracking-wider mb-1">Metrics</p>
                  <h3 className="font-extrabold text-[#1B1D28] text-lg leading-tight">National<br/>Average</h3>
                </div>
                <div className="bg-[#F6E8FE] p-2.5 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-[#613EEA]" />
                </div>
              </div>

              <div className="mb-8">
                <StyledSelect bgClass="bg-white/60" value={natAvgState} onChange={(e)=>setNatAvgState(e.target.value)} options={statesList} />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-bold text-[#1B1D28] mb-1.5"><span className="truncate pr-2">{natAvgState}</span><span>₹{Math.round(selectedNatAvgState500)}</span></div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-[#FF7349] h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min((selectedNatAvgState500 / 5000) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold text-[#1B1D28] mb-1.5"><span>National Avg</span><span>₹{Math.round(nationalAvg500)}</span></div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-[#A0A3B1] h-2 rounded-full transition-all duration-1000" style={{ width: `${(nationalAvg500 / 5000) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </article>

          </section>
        </div>

        <AdUnit />

        {/* TARIFF LIST SECTION (Matches "Task Groups") */}
        <div className="pt-2">
          <h2 className="text-2xl font-extrabold text-[#1B1D28] mb-6">Tariff Lookup <span className="bg-[#EDF4FF] text-[#1678FF] text-sm px-2 py-0.5 rounded-full ml-2">2</span></h2>
          
          <div className="space-y-4">
            
            {/* List Item 1 */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F1F5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="bg-[#FFE2ED] p-4 rounded-2xl shrink-0">
                  <Home className="h-6 w-6 text-[#FF6D9B]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#1B1D28] text-lg">Domestic Slabs</h4>
                  <p className="text-[#8E92A4] font-medium text-sm">Select state below to view</p>
                </div>
              </div>
              
              <div className="w-full sm:w-64 shrink-0">
                 <StyledSelect bgClass="bg-[#FAFAFD]" value={lookupState} onChange={(e)=>setLookupState(e.target.value)} options={statesList} />
              </div>
            </div>

            {/* Slabs Display for Domestic */}
            <div className="bg-[#FAFAFD] rounded-2xl p-5 border border-[#F0F1F5] ml-0 sm:ml-[4.5rem]">
              <ul className="space-y-3 text-sm text-gray-600 font-medium">
                {tariffData[lookupState]?.Domestic?.slabs?.map((s, i) => (
                  <li key={i} className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                    <span>Up to {s.max === Infinity ? 'Above' : s.max} units</span><span className="font-bold text-[#1B1D28]">₹{s.rate.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* List Item 2 */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F1F5] flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
              <div className="bg-[#F6E8FE] p-4 rounded-2xl shrink-0">
                <Building2 className="h-6 w-6 text-[#613EEA]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#1B1D28] text-lg">Commercial Slabs ({lookupState})</h4>
                <p className="text-[#8E92A4] font-medium text-sm">Higher rates for cross-subsidization</p>
              </div>
            </div>

            {/* Slabs Display for Commercial */}
            <div className="bg-[#FAFAFD] rounded-2xl p-5 border border-[#F0F1F5] ml-0 sm:ml-[4.5rem]">
              <ul className="space-y-3 text-sm text-gray-600 font-medium">
                {tariffData[lookupState]?.Commercial?.slabs?.map((s, i) => (
                  <li key={i} className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                    <span>Up to {s.max === Infinity ? 'Above' : s.max} units</span><span className="font-bold text-[#1B1D28]">₹{s.rate.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* FAQs (Also matching the Task Groups style) */}
        <div className="pt-8">
          <h2 className="text-2xl font-extrabold text-[#1B1D28] mb-6">Learning <span className="bg-[#FFF0E7] text-[#FF7349] text-sm px-2 py-0.5 rounded-full ml-2">Tips</span></h2>
          
          <div className="space-y-4">
            {faqs.slice(0, 5).map((faq, idx) => (
              <article key={idx} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F1F5] overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                  className="w-full p-4 flex justify-between items-center text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#FFF0E7] p-3 rounded-xl shrink-0">
                      <Lightbulb className="h-5 w-5 text-[#FF7349]" />
                    </div>
                    <span className="font-bold text-[#1B1D28] text-[15px] pr-4">{faq.q}</span>
                  </div>
                  
                  {/* Circular progress acting as a decorative toggle icon */}
                  <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F0F1F5" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke={openFaq === idx ? "#613EEA" : "#A0A3B1"} strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={openFaq === idx ? "0" : "180"} strokeLinecap="round" className="transition-all duration-500" />
                    </svg>
                    <ChevronDown className={`absolute h-4 w-4 text-[#1B1D28] transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-[#613EEA]' : ''}`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 pb-5 ml-[3.5rem] text-[#8E92A4] text-sm leading-relaxed font-medium">
                    {faq.a}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

      </main>

      {/* CLEAN FOOTER */}
      <footer className="mt-20 border-t border-[#F0F1F5] bg-white pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <h3 className="text-xl font-extrabold mb-8 text-[#1B1D28]">State Calculators</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {statesList.map(s => (
                <Link 
                  key={s} 
                  href={`/calculator/${s.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                  className="bg-[#FAFAFD] border border-[#F0F1F5] hover:border-[#613EEA] hover:bg-white text-xs text-[#8E92A4] hover:text-[#613EEA] font-bold px-3 py-3 rounded-xl transition-all duration-300 text-center truncate"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="border-t border-[#F0F1F5] pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#A0A3B1] font-bold">
            <div className="flex items-center gap-2">
              <div className="bg-[#613EEA] p-2 rounded-lg">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="font-black text-[#1B1D28] tracking-wider uppercase">VidyutCalc</span>
            </div>
            
            <p className="text-center md:text-left font-medium">© {new Date().getFullYear()} VidyutCalc India.</p>
            
            <div className="flex gap-6">
              <Link href="#" className="hover:text-[#613EEA] transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-[#613EEA] transition-colors">Terms</Link>
              <Link href="#" className="hover:text-[#613EEA] transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
