'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, Zap, Lightbulb, ShieldCheck, MapPin, 
  Menu, X, BarChart3, Scale, Info, HelpCircle, ChevronDown, 
  Home, Building2, TrendingUp, DollarSign, ListOrdered, FileSearch, TableProperties,
  Search, Plus, Minus, Calculator, Snowflake, Tv, Droplets, Laptop, Shirt, Coffee, Wind, Sun, Activity
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

// --- STATIC CONTENT & DATA ---
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

// --- APPLIANCE LIBRARY DATA ---
const applianceCatalog = [
  { id: 'ac-1.5', name: '1.5 Ton AC', watts: 1500, defaultHours: 8, icon: Snowflake, color: '#3b82f6' }, // Blue
  { id: 'ac-1.0', name: '1.0 Ton AC', watts: 1000, defaultHours: 8, icon: Snowflake, color: '#60a5fa' }, // Light Blue
  { id: 'geyser', name: 'Water Heater', watts: 2000, defaultHours: 1, icon: Droplets, color: '#ef4444' }, // Red
  { id: 'fridge', name: 'Refrigerator', watts: 150, defaultHours: 24, icon: Home, color: '#f59e0b' }, // Amber
  { id: 'wm', name: 'Washing Machine', watts: 500, defaultHours: 1, icon: Shirt, color: '#8b5cf6' }, // Purple
  { id: 'cooler', name: 'Desert Cooler', watts: 250, defaultHours: 10, icon: Wind, color: '#0ea5e9' }, // Cyan
  { id: 'tv', name: 'LED TV (43")', watts: 60, defaultHours: 4, icon: Tv, color: '#ec4899' }, // Pink
  { id: 'bldc-fan', name: 'BLDC Fan', watts: 28, defaultHours: 12, icon: Wind, color: '#10b981' }, // Emerald
  { id: 'fan-std', name: 'Standard Fan', watts: 75, defaultHours: 12, icon: Wind, color: '#34d399' }, // Light Green
  { id: 'led', name: 'LED Tube/Bulb', watts: 20, defaultHours: 6, icon: Lightbulb, color: '#fcd34d' }, // Yellow
  { id: 'mixer', name: 'Mixer Grinder', watts: 500, defaultHours: 0.5, icon: Coffee, color: '#6366f1' }, // Indigo
  { id: 'laptop', name: 'Laptop / PC', watts: 65, defaultHours: 6, icon: Laptop, color: '#64748b' }, // Gray
];

interface NeuSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (string | { val: string; label: string })[];
  className?: string;
}

const NeuSelect: React.FC<NeuSelectProps> = ({ value, onChange, options, className = "" }) => (
  <div className={`relative group ${className}`}>
    <select 
      className="w-full bg-neuBg shadow-neu focus:shadow-neu-inset hover:shadow-[5px_5px_10px_#d1d9d3,-5px_-5px_10px_#ffffff] rounded-xl px-5 py-4 font-bold text-neuDark outline-none transition-all duration-300 appearance-none cursor-pointer"
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
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 group-hover:translate-y(-2px)">
      <ChevronDown className="h-5 w-5 text-neuGreen" />
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
  
  // Calculator State
  const [state, setState] = useState(initialState);
  const [connType, setConnType] = useState('Domestic');
  const [units, setUnits] = useState('');
  const [tariff, setTariff] = useState<TariffDetails>(
    tariffData[state]?.[connType] || tariffData['Maharashtra']['Domestic']
  );
  const [isEditing, setIsEditing] = useState(false);
  const [billResult, setBillResult] = useState<BillResult | null>(null);

  // Input Mode State
  const [inputMode, setInputMode] = useState<'manual' | 'appliances'>('manual');
  
  // Appliance Library State
  const [searchAppliance, setSearchAppliance] = useState('');
  const [homeAppliances, setHomeAppliances] = useState<Record<string, {qty: number, hours: number}>>({});

  // Solar ROI State
  const [solarUnitsInput, setSolarUnitsInput] = useState('');

  // Widget States
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

  useEffect(() => {
    if (billResult?.consumed) {
      setSolarUnitsInput(billResult.consumed.toString());
    }
  }, [billResult]);

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

  // --- Appliance Library Logic ---
  const handleApplianceChange = (id: string, field: 'qty' | 'hours', value: number) => {
    setHomeAppliances(prev => {
      const current = prev[id] || { qty: 0, hours: applianceCatalog.find(a => a.id === id)?.defaultHours || 0 };
      const updatedValue = Math.max(0, value);
      
      if (field === 'qty' && updatedValue === 0) {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      }
      
      return { ...prev, [id]: { ...current, [field]: updatedValue } };
    });
  };

  const applianceBreakdown = Object.entries(homeAppliances).map(([id, data]) => {
    const app = applianceCatalog.find(a => a.id === id);
    if (!app) return { name: 'Unknown', kwh: 0, color: '#cbd5e1' };
    return {
      name: app.name,
      kwh: (app.watts * data.hours * data.qty * 30) / 1000,
      color: app.color
    };
  }).filter(app => app.kwh > 0).sort((a, b) => b.kwh - a.kwh);

  const totalApplianceUnits = applianceBreakdown.reduce((acc, curr) => acc + curr.kwh, 0);

  const applyApplianceUnits = () => {
    setUnits(Math.round(totalApplianceUnits).toString());
    setInputMode('manual');
    window.scrollTo({top: document.getElementById('calculator')?.offsetTop, behavior: 'smooth'});
  };

  const filteredAppliances = applianceCatalog.filter(app => 
    app.name.toLowerCase().includes(searchAppliance.toLowerCase())
  );

  // --- Solar ROI Logic ---
  const calculateSolarROI = () => {
    const monthlyUnits = parseFloat(solarUnitsInput);
    if (isNaN(monthlyUnits) || monthlyUnits <= 0) return null;

    let capacity = Math.ceil(monthlyUnits / 120);
    if (capacity < 1) capacity = 1;

    const estimatedCost = capacity * 60000;
    let subsidy = 0;
    if (capacity <= 2) {
      subsidy = capacity * 30000;
    } else if (capacity === 3) {
      subsidy = (2 * 30000) + 18000;
    } else {
      subsidy = 78000; 
    }

    const netCost = estimatedCost - subsidy;
    const avgRate = 7.5; 
    const annualSavings = (monthlyUnits * avgRate) * 12;
    const paybackYears = (netCost / annualSavings).toFixed(1);

    return { capacity, estimatedCost, subsidy, netCost, annualSavings, paybackYears };
  };

  const solarData = calculateSolarROI();

  // --- Chart Helpers ---
  const getGaugeColor = (val: number) => {
    if (val <= 200) return '#10b981'; // Green (Efficient)
    if (val <= 400) return '#f59e0b'; // Yellow (Average)
    if (val <= 600) return '#f97316'; // Orange (High)
    return '#ef4444'; // Red (Excessive)
  };

  const getGaugeLabel = (val: number) => {
    if (val <= 200) return 'Highly Efficient';
    if (val <= 400) return 'Average Usage';
    if (val <= 600) return 'High Consumption';
    return 'Excessive Usage';
  };

  const gaugeValue = parseFloat(units) || 0;
  const gaugePercent = Math.min(Math.max(gaugeValue / 800, 0), 1); // Cap at 800 for the visual arc
  const gaugeStrokeDashoffset = 251.2 * (1 - gaugePercent); // 251.2 is approx Math.PI * 80 (radius)

  // Donut Chart Math
  let cumulativePercent = 0;

  const nationalAvg500 = 3500; 
  const safeData = tariffData || {};
  const fallbackTariff = safeData['Maharashtra']?.Domestic || { slabs: [{ max: Infinity, rate: 7.5 }], fixedCharge: 100, meterRent: 10, dutyPercent: 5, fac: 0.1 };
  const selectedNatAvgState500 = calculateEngine(500, safeData[natAvgState]?.Domestic || fallbackTariff).finalTotal;
  const compA500 = calculateEngine(500, safeData[compStateA]?.Domestic || fallbackTariff).finalTotal;
  const compB500 = calculateEngine(500, safeData[compStateB]?.Domestic || fallbackTariff).finalTotal;

  return (
    <div className="min-h-screen bg-neuBg font-sans text-neuDark selection:bg-neuGreen selection:text-white transition-colors duration-300 overflow-x-hidden">

      <header className="sticky top-0 z-50 bg-neuBg shadow-neu-sm mb-8 border-b border-[#e2e8e4]">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="bg-neuBg shadow-neu p-2.5 rounded-full flex items-center justify-center transition-all duration-300 group-hover:shadow-neu-inset">
              <Zap className="h-6 w-6 text-neuGreen fill-neuGreen transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="font-black text-2xl tracking-tight text-neuGreen">VidyutCalc</span>
          </Link>
          <nav className="hidden md:flex gap-8 font-bold text-sm text-gray-600">
            <a href="#calculator" className="hover:text-neuGreen transition-colors duration-300">Calculator</a>
            <a href="#solar" className="hover:text-neuGreen transition-colors duration-300">Solar ROI</a>
            <a href="#compare" className="hover:text-neuGreen transition-colors duration-300">Compare</a>
            <a href="#lookup" className="hover:text-neuGreen transition-colors duration-300">Tariffs</a>
          </nav>
          <button className="md:hidden text-neuDark bg-neuBg shadow-neu active:shadow-neu-inset p-2.5 rounded-xl transition-all duration-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-neuBg shadow-neu px-6 py-6 space-y-4 font-bold text-neuDark absolute w-full z-40 border-t border-[#d1d9d3] origin-top animate-in slide-in-from-top-2">
            <a href="#calculator" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-3 bg-neuBg shadow-neu hover:shadow-neu-inset rounded-xl transition-all duration-300 text-center">Calculator</a>
            <a href="#solar" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-3 bg-neuBg shadow-neu hover:shadow-neu-inset rounded-xl transition-all duration-300 text-center">Solar ROI</a>
            <a href="#compare" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-3 bg-neuBg shadow-neu hover:shadow-neu-inset rounded-xl transition-all duration-300 text-center">Compare</a>
            <a href="#lookup" onClick={()=>setIsMenuOpen(false)} className="block px-4 py-3 bg-neuBg shadow-neu hover:shadow-neu-inset rounded-xl transition-all duration-300 text-center">Tariff Lookup</a>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 space-y-24">

        <section id="calculator" className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-neuDark tracking-tight leading-tight">
              Accurate Electricity Bill<br/><span className="text-neuGreen">Calculator</span> for India
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">Instantly calculate your energy charges, fixed costs, and taxes for 36 States & UTs.</p>
          </div>

          <article className="bg-neuBg rounded-[2rem] shadow-neu p-6 md:p-10 transition-all duration-300 mb-16 border border-[#e2e8e4]">
            
            <div className="flex bg-neuBg shadow-neu-inset rounded-xl p-1 mb-8 w-full md:w-fit mx-auto">
              <button 
                onClick={() => setInputMode('manual')} 
                className={`flex-1 md:w-48 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${inputMode === 'manual' ? 'bg-neuBg shadow-neu text-neuGreen' : 'text-gray-500 hover:text-neuDark'}`}
              >
                Manual Entry
              </button>
              <button 
                onClick={() => setInputMode('appliances')} 
                className={`flex-1 md:w-48 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${inputMode === 'appliances' ? 'bg-neuBg shadow-neu text-neuGreen' : 'text-gray-500 hover:text-neuDark'}`}
              >
                Appliance Library
              </button>
            </div>

            {inputMode === 'manual' ? (
              <div className="animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2">State / UT</label>
                    <NeuSelect value={state} onChange={(e) => setState(e.target.value)} options={statesList} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2">Connection</label>
                    <NeuSelect 
                      value={connType} 
                      onChange={(e) => setConnType(e.target.value)} 
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
                          {tariff?.slabs?.map((s, i) => (
                            <li key={i} className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-2"><span>Up to {s.max === Infinity ? 'Above' : s.max} units</span><span className="font-bold text-neuDark text-base">₹{s.rate.toFixed(2)}</span></li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold mb-4 text-xs uppercase tracking-wider flex items-center gap-2"><DollarSign className="h-4 w-4"/> Other Charges</p>
                        <ul className="space-y-3 text-gray-600">
                          <li className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-2"><span>Fixed Charge</span><span className="font-bold text-neuDark text-base">₹{tariff?.fixedCharge}</span></li>
                          <li className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-2"><span>Duty Tax</span><span className="font-bold text-neuDark text-base">{tariff?.dutyPercent}%</span></li>
                          <li className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-2"><span>FPPCA / Unit</span><span className="font-bold text-neuDark text-base">₹{tariff?.fac}</span></li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 bg-neuBg rounded-b-[1rem] text-sm">
                       <div><label className="block text-xs font-bold text-gray-500 mb-3">Fixed (₹)</label><input type="number" value={tariff?.fixedCharge} onChange={(e) => handleTariffChange(e, 'fixedCharge')} className="w-full bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-neuDark outline-none focus:ring-2 focus:ring-neuGreen transition-all" /></div>
                       <div><label className="block text-xs font-bold text-gray-500 mb-3">Rent (₹)</label><input type="number" value={tariff?.meterRent} onChange={(e) => handleTariffChange(e, 'meterRent')} className="w-full bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-neuDark outline-none focus:ring-2 focus:ring-neuGreen transition-all" /></div>
                       <div><label className="block text-xs font-bold text-gray-500 mb-3">Duty (%)</label><input type="number" value={tariff?.dutyPercent} onChange={(e) => handleTariffChange(e, 'dutyPercent')} className="w-full bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-neuDark outline-none focus:ring-2 focus:ring-neuGreen transition-all" /></div>
                       <div><label className="block text-xs font-bold text-gray-500 mb-3">FAC (₹)</label><input type="number" value={tariff?.fac} onChange={(e) => handleTariffChange(e, 'fac')} className="w-full bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-neuDark outline-none focus:ring-2 focus:ring-neuGreen transition-all" /></div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={calculateBill} 
                  className="w-full bg-neuBg text-neuGreen font-black text-xl py-6 rounded-2xl shadow-neu active:shadow-neu-inset hover:text-neuDark transition-all duration-300 flex justify-center items-center gap-3 border border-[#e2e8e4]"
                >
                  <Zap className="h-6 w-6" /> Generate Detailed Bill
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input 
                      type="text" 
                      placeholder="Search appliances (e.g. AC, Fan, TV)..." 
                      value={searchAppliance}
                      onChange={(e) => setSearchAppliance(e.target.value)}
                      className="w-full bg-neuBg shadow-neu-inset rounded-xl pl-12 pr-5 py-4 font-bold text-neuDark outline-none transition-all duration-300 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-h-[500px] overflow-y-auto p-2 pr-4 rounded-xl custom-scrollbar">
                  {filteredAppliances.map(app => {
                    const qty = homeAppliances[app.id]?.qty || 0;
                    const hours = homeAppliances[app.id]?.hours || app.defaultHours;
                    const Icon = app.icon;

                    return (
                      <div key={app.id} className={`p-5 rounded-[1.5rem] transition-all duration-300 ${qty > 0 ? 'shadow-neu-inset border-2 border-[#d1d9d3]' : 'shadow-neu border-2 border-transparent'}`}>
                         <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                               <div className="bg-neuBg shadow-neu p-2.5 rounded-xl text-neuGreen shrink-0">
                                 <Icon size={20}/>
                               </div>
                               <div>
                                  <p className="font-bold text-neuDark leading-tight">{app.name}</p>
                                  <p className="text-xs text-gray-500 font-medium mt-1">{app.watts}W</p>
                               </div>
                            </div>
                         </div>
                         
                         <div className="flex items-center justify-between mt-4 bg-neuBg p-2 rounded-xl shadow-neu-inset border border-[#e2e8e4]">
                            <div className="flex items-center gap-3">
                               <button onClick={()=>handleApplianceChange(app.id, 'qty', qty - 1)} className="bg-neuBg shadow-neu active:shadow-neu-inset h-8 w-8 rounded-lg flex items-center justify-center text-neuDark font-bold hover:text-red-500 transition-colors"><Minus size={16}/></button>
                               <span className="font-black w-4 text-center text-neuDark">{qty}</span>
                               <button onClick={()=>handleApplianceChange(app.id, 'qty', qty + 1)} className="bg-neuBg shadow-neu active:shadow-neu-inset h-8 w-8 rounded-lg flex items-center justify-center text-neuDark font-bold hover:text-neuGreen transition-colors"><Plus size={16}/></button>
                            </div>
                            
                            {qty > 0 ? (
                               <div className="flex items-center gap-2">
                                  <input type="number" value={hours} onChange={(e)=>handleApplianceChange(app.id, 'hours', parseFloat(e.target.value)||0)} className="w-14 bg-neuBg shadow-neu rounded-lg p-1.5 text-center font-black text-sm outline-none text-neuGreen" />
                                  <span className="text-xs text-gray-500 font-bold">Hrs/Day</span>
                               </div>
                            ) : (
                               <span className="text-xs text-gray-400 font-bold px-2">Add appliance</span>
                            )}
                         </div>
                      </div>
                    )
                  })}
                </div>

                <div className="bg-neuBg shadow-neu rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t-4 border-neuGreen">
                  <div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">Estimated Monthly Consumption</p>
                    <p className="text-4xl font-black text-neuDark tracking-tight">{Math.round(totalApplianceUnits)} <span className="text-lg text-neuGreen">kWh (Units)</span></p>
                  </div>
                  <button 
                    onClick={applyApplianceUnits} 
                    disabled={totalApplianceUnits === 0}
                    className="w-full md:w-auto bg-neuBg text-neuGreen font-black px-8 py-4 rounded-xl shadow-neu active:shadow-neu-inset transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:shadow-neu"
                  >
                    <Calculator className="h-5 w-5" /> Apply & Calculate Bill
                  </button>
                </div>
              </div>
            )}
          </article>

          {/* --- NEW: ENERGY ANALYTICS VISUALIZERS --- */}
          {billResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 animate-in slide-in-from-bottom-8">
              
              {/* Custom SVG Gauge (Efficiency Meter) */}
              <div className="bg-neuBg rounded-[2rem] p-8 shadow-neu border border-[#e2e8e4]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-black text-xl text-neuDark">Efficiency Gauge</h3>
                    <p className="text-sm text-gray-500 font-medium">Your monthly consumption profile.</p>
                  </div>
                  <div className="bg-neuBg shadow-neu-inset p-2.5 rounded-xl"><Activity className="h-5 w-5 text-neuGreen" /></div>
                </div>

                <div className="relative w-full h-48 flex items-end justify-center pt-8 overflow-hidden">
                  <svg viewBox="0 0 200 100" className="w-full max-w-[300px] overflow-visible">
                    {/* Track */}
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#d1d9d3" strokeWidth="20" strokeLinecap="round" className="drop-shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]" />
                    {/* Fill */}
                    <path 
                      d="M 20 100 A 80 80 0 0 1 180 100" 
                      fill="none" 
                      stroke={getGaugeColor(gaugeValue)} 
                      strokeWidth="20" 
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset={gaugeStrokeDashoffset}
                      className="transition-all duration-1000 ease-out"
                    />
                    {/* Tick Markers */}
                    <line x1="20" y1="100" x2="10" y2="100" stroke="#a0aec0" strokeWidth="3" />
                    <line x1="180" y1="100" x2="190" y2="100" stroke="#a0aec0" strokeWidth="3" />
                    <line x1="100" y1="20" x2="100" y2="10" stroke="#a0aec0" strokeWidth="3" />
                  </svg>
                  <div className="absolute bottom-2 flex flex-col items-center">
                    <span className="text-4xl font-black text-neuDark">{gaugeValue}</span>
                    <span className="text-sm font-bold uppercase tracking-widest text-gray-500">{getGaugeLabel(gaugeValue)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs font-bold text-gray-400 mt-6 pt-4 border-t border-[#d1d9d3] px-2">
                  <span>0<br/>Good</span>
                  <span className="text-center">400<br/>Avg</span>
                  <span className="text-right">800+<br/>High</span>
                </div>
              </div>

              {/* Custom SVG Donut Chart (Energy Hogs) */}
              <div className="bg-neuBg rounded-[2rem] p-8 shadow-neu border border-[#e2e8e4]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-black text-xl text-neuDark">Energy Breakdown</h3>
                    <p className="text-sm text-gray-500 font-medium">Top appliance power consumers.</p>
                  </div>
                  <div className="bg-neuBg shadow-neu-inset p-2.5 rounded-xl"><Scale className="h-5 w-5 text-neuGreen" /></div>
                </div>

                {applianceBreakdown.length > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center gap-8 h-full pb-4">
                    {/* Donut Graphic */}
                    <div className="relative w-40 h-40 shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-md">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#d1d9d3" strokeWidth="12" />
                        {applianceBreakdown.map((app, i) => {
                          const percent = app.kwh / totalApplianceUnits;
                          const offset = 251.2 - (percent * 251.2);
                          const currentAccum = cumulativePercent;
                          cumulativePercent += percent;
                          
                          return (
                            <circle 
                              key={i}
                              cx="50" cy="50" r="40" 
                              fill="none" 
                              stroke={app.color} 
                              strokeWidth="12"
                              strokeDasharray="251.2"
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                              style={{ transformOrigin: 'center', transform: `rotate(${currentAccum * 360}deg)` }}
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <Zap className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="w-full space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                      {applianceBreakdown.slice(0, 5).map((app, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: app.color }}></div>
                            <span className="text-sm font-bold text-gray-600 truncate">{app.name}</span>
                          </div>
                          <span className="text-sm font-black text-neuDark ml-2">{Math.round((app.kwh / totalApplianceUnits) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 w-full flex flex-col items-center justify-center bg-neuBg shadow-neu-inset rounded-xl border border-[#d1d9d3]">
                    <Search className="h-8 w-8 text-gray-400 mb-3" />
                    <p className="text-sm font-bold text-gray-500 text-center px-4">Use the Appliance Library above to see your customized breakdown.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DETAILED RESULTS BREAKDOWN CARD */}
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
                 {billResult.slabBreakdown.map((b, i) => (
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
        </section>

        {/* --- SOLAR ROI ESTIMATOR --- */}
        <section id="solar" className="max-w-4xl mx-auto">
          <div className="bg-neuBg rounded-[2rem] shadow-neu p-8 md:p-12 border border-[#e2e8e4] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
              <Sun size={200} className="text-yellow-500 fill-yellow-500 animate-spin-slow" />
            </div>
            
            <div className="mb-10 relative z-10">
              <h2 className="text-3xl font-black text-neuDark flex items-center gap-3 mb-2">
                <div className="bg-neuBg shadow-neu p-2.5 rounded-xl"><Sun className="h-6 w-6 text-yellow-500 fill-yellow-500" /></div>
                Solar ROI Estimator
              </h2>
              <p className="text-gray-500 font-medium ml-1">Calculate your savings under the <span className="font-bold text-neuDark">PM Surya Ghar Yojana</span>.</p>
            </div>

            <div className="bg-neuBg shadow-neu-inset rounded-2xl p-6 mb-10 relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2">Monthly Consumption (Units)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 350" 
                  value={solarUnitsInput} 
                  onChange={(e) => setSolarUnitsInput(e.target.value)} 
                  className="w-full bg-neuBg shadow-neu focus:shadow-neu-inset rounded-xl px-5 py-4 font-black text-xl text-neuDark outline-none transition-all duration-300" 
                />
              </div>
              <div className="w-full md:w-1/2 flex items-center justify-center pt-2 md:pt-6">
                {solarUnitsInput && parseFloat(solarUnitsInput) > 0 ? (
                   <div className="text-center w-full">
                     <p className="text-gray-500 font-bold text-sm mb-1">Recommended Plant Size</p>
                     <p className="text-3xl font-black text-neuGreen drop-shadow-sm">{solarData?.capacity} <span className="text-xl text-neuDark">kW</span></p>
                   </div>
                ) : (
                   <p className="text-sm text-gray-400 font-bold text-center w-full">Enter units to see recommended kW</p>
                )}
              </div>
            </div>

            {solarData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10 animate-in fade-in duration-500">
                <div className="bg-neuBg shadow-neu p-6 rounded-2xl text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Est. Cost</p>
                  <p className="text-xl font-black text-neuDark">₹{solarData.estimatedCost.toLocaleString()}</p>
                </div>
                <div className="bg-neuBg shadow-neu p-6 rounded-2xl text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Govt. Subsidy</p>
                  <p className="text-xl font-black text-green-500 drop-shadow-sm">-₹{solarData.subsidy.toLocaleString()}</p>
                </div>
                <div className="bg-neuBg shadow-neu p-6 rounded-2xl text-center border-b-4 border-neuGreen sm:border-b-0">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Net Investment</p>
                  <p className="text-xl font-black text-neuDark">₹{solarData.netCost.toLocaleString()}</p>
                </div>
                <div className="bg-neuBg shadow-neu p-6 rounded-2xl text-center border-b-4 border-yellow-500 sm:border-b-0">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Payback Period</p>
                  <p className="text-xl font-black text-neuDark">{solarData.paybackYears} <span className="text-sm text-gray-500">Yrs</span></p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* DATA VISUALIZERS */}
        <section id="compare" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
                    <td className="p-5 font-bold text-neuDark">₹{tariffData[tableState]?.Domestic?.fixedCharge || 0}</td>
                    <td className="p-5 font-bold text-neuDark">₹{tariffData[tableState]?.Commercial?.fixedCharge || 0}</td>
                  </tr>
                  <tr className="border-b border-[#d1d9d3] hover:bg-gray-50/30 transition-colors">
                    <td className="p-5">Meter Rent</td>
                    <td className="p-5 font-bold text-neuDark">₹{tariffData[tableState]?.Domestic?.meterRent || 0}</td>
                    <td className="p-5 font-bold text-neuDark">₹{tariffData[tableState]?.Commercial?.meterRent || 0}</td>
                  </tr>
                  <tr className="border-b border-[#d1d9d3] hover:bg-gray-50/30 transition-colors">
                    <td className="p-5">Electricity Duty</td>
                    <td className="p-5 font-bold text-neuDark">{tariffData[tableState]?.Domestic?.dutyPercent || 0}%</td>
                    <td className="p-5 font-bold text-neuDark">{tariffData[tableState]?.Commercial?.dutyPercent || 0}%</td>
                  </tr>
                  <tr className="hover:bg-gray-50/30 transition-colors">
                    <td className="p-5">FPPCA (per unit)</td>
                    <td className="p-5 font-bold text-neuDark">₹{tariffData[tableState]?.Domestic?.fac?.toFixed(2) || '0.00'}</td>
                    <td className="p-5 font-bold text-neuDark">₹{tariffData[tableState]?.Commercial?.fac?.toFixed(2) || '0.00'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

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
                  {tariffData[lookupState]?.Domestic?.slabs?.map((s, i) => (
                    <li key={i} className="flex justify-between border-b border-dashed border-[#d1d9d3] pb-2">
                      <span>Up to {s.max === Infinity ? 'Above' : s.max}</span><span className="font-bold text-neuDark text-base">₹{s.rate.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-neuBg shadow-neu-inset p-6 rounded-[1.5rem] border border-[#e2e8e4] hover:shadow-[inset_8px_8px_15px_#d1d9d3,inset_-8px_-8px_15px_#ffffff] transition-all">
                <h4 className="font-black text-neuDark mb-5 border-b-2 border-gray-400 pb-3 inline-flex items-center gap-2"><Building2 className="h-4 w-4"/> Commercial Slabs</h4>
                <ul className="space-y-4 text-sm text-gray-600 font-medium">
                  {tariffData[lookupState]?.Commercial?.slabs?.map((s, i) => (
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
              <p className="text-sm text-gray-500 leading-relaxed font-medium">A mandatory monthly fee regardless of consumption. It covers the cost of maintaining the power grid, transformers, and the physical wires connecting to your meter. Usually scales with your &quot;Connected Load&quot;.</p>
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

      <footer className="bg-neuBg shadow-[0_-10px_30px_rgba(209,217,211,0.7)] pt-20 pb-10 mt-10 border-t border-[#e2e8e4]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-16">
            <h3 className="text-2xl font-black mb-10 text-neuDark flex items-center gap-3">
              <div className="bg-neuBg shadow-neu-inset p-2.5 rounded-xl"><MapPin className="text-neuGreen h-6 w-6" /></div> Quick Links: State Bill Calculators
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {statesList.map(s => (
                <Link 
                  key={s} 
                  href={`/calculator/${s.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                  className="group flex items-center justify-start h-[40px] w-full text-xs sm:text-sm text-gray-600 font-bold bg-neuBg shadow-neu hover:shadow-neu-inset active:shadow-neu-inset px-4 rounded-xl hover:text-neuGreen hover:bg-[#e8f0eb] transition-all duration-300 border border-transparent hover:border-[#e2e8e4]"
                >
                  <Zap className="h-4 w-4 text-gray-400 group-hover:text-neuGreen shrink-0 mr-2 transition-colors" />
                  <span className="truncate">{s}</span>
                </Link>
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
              <Link href="#" className="hover:text-neuGreen transition-colors duration-300">Privacy Policy</Link>
              <Link href="#" className="hover:text-neuGreen transition-colors duration-300">Terms of Service</Link>
              <Link href="#" className="hover:text-neuGreen transition-colors duration-300">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
