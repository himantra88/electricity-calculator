'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, ChevronRight, Zap, Lightbulb, BookOpen, ShieldCheck, MapPin, 
  Menu, X, BarChart3, Scale, Info, HelpCircle, ChevronDown, BatteryCharging, 
  Sun, Wind, Home, Building2, TrendingUp, DollarSign
} from 'lucide-react';

// --- DATA STRUCTURES (Keep your existing data exactly the same) ---
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
  "Buy 5-Star Appliances: They cost more upfront but save thousands in electricity bills."
];

const faqs = [
  { q: "What is 1 unit of electricity?", a: "1 unit is equal to 1 Kilowatt-hour (kWh). It is the energy consumed by a 1000-watt appliance running for 1 hour." },
  { q: "What is FPPCA?", a: "Fuel and Power Purchase Cost Adjustment. It's a fluctuating surcharge added to recover changes in the cost of coal and fuel." },
  { q: "How are telescopic slabs calculated?", a: "Units are split into tiers. The first few units are cheap, and subsequent units are charged at progressively higher rates." }
];

// Reusable AdSense Component
const AdUnit = ({ className = "my-8 rounded-xl overflow-hidden shadow-neu-inset" }) => (
  <aside className={`w-full ${className}`}>
    {/* In production, replace this placeholder with actual Google AdSense <ins> tag */}
    <div className="adsbygoogle-placeholder w-full rounded-xl">
      Advertisement Space
    </div>
  </aside>
);

export default function ElectricityCalculator() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [state, setState] = useState('Maharashtra');
  const [connType, setConnType] = useState('Domestic');
  const [units, setUnits] = useState('');
  const [tariff, setTariff] = useState(defaultTariffData[state][connType]);
  const [isEditing, setIsEditing] = useState(false);
  const [billResult, setBillResult] = useState<any>(null);

  const [compStateA, setCompStateA] = useState('Maharashtra');
  const [compStateB, setCompStateB] = useState('Delhi');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setTariff(defaultTariffData[state][connType]);
    setBillResult(null); 
  }, [state, connType]);

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

  const nationalAvg500 = 3500; 
  const currentState500 = calculateEngine(500, defaultTariffData[state]['Domestic']).finalTotal;
  const compA500 = calculateEngine(500, defaultTariffData[compStateA]['Domestic']).finalTotal;
  const compB500 = calculateEngine(500, defaultTariffData[compStateB]['Domestic']).finalTotal;

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

      {/* HEADER - Neumorphic Style */}
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
            <a href="#guide" className="hover:text-neuGreen transition-colors duration-300">Guides</a>
            <a href="#faqs" className="hover:text-neuGreen transition-colors duration-300">FAQs</a>
          </nav>
        </div>
      </header>

      {/* TOP AD UNIT */}
      <div className="max-w-4xl mx-auto px-4">
        <AdUnit />
      </div>

      <main>
        {/* HERO & CALCULATOR */}
        <section id="calculator" className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-neuDark">Accurate Electricity Bill<br/>Calculator for India</h1>
            <p className="text-gray-500 text-lg">Instantly calculate your energy charges for 36 States & UTs.</p>
          </div>

          <article className="bg-neuBg rounded-3xl shadow-neu p-6 md:p-8 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">State / UT</label>
                <select 
                  className="w-full bg-neuBg shadow-neu-inset rounded-xl px-4 py-4 focus:ring-2 focus:ring-neuGreen font-bold text-neuDark outline-none transition-all duration-300 appearance-none" 
                  value={state} onChange={(e) => setState(e.target.value)}
                >
                  {statesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Connection</label>
                <select 
                  className="w-full bg-neuBg shadow-neu-inset rounded-xl px-4 py-4 focus:ring-2 focus:ring-neuGreen font-bold text-neuDark outline-none transition-all duration-300 appearance-none" 
                  value={connType} onChange={(e) => setConnType(e.target.value)}
                >
                  <option value="Domestic">🏠 Domestic</option>
                  <option value="Commercial">🏢 Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Units (kWh)</label>
                <input 
                  type="number" placeholder="e.g. 250" value={units} onChange={(e) => setUnits(e.target.value)} 
                  className="w-full bg-neuBg shadow-neu-inset rounded-xl px-4 py-4 focus:ring-2 focus:ring-neuGreen font-black text-xl text-neuDark outline-none transition-all duration-300" 
                />
              </div>
            </div>

            <button 
              onClick={calculateBill} 
              className="w-full bg-neuBg text-neuGreen font-black text-lg py-5 rounded-2xl shadow-neu active:shadow-neu-inset transition-all duration-300 flex justify-center items-center gap-2"
            >
              <Zap className="h-5 w-5" /> Calculate Bill Now
            </button>
          </article>

          {/* RESULTS CARD */}
          {billResult && (
            <div className="mt-12 bg-neuBg rounded-3xl p-6 md:p-8 shadow-neu border-t-4 border-neuGreen transition-all duration-500">
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
                     <span className="font-medium">{b.units} units × ₹{b.rate} <span className="text-xs text-gray-400">({b.range})</span></span>
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
        </section>

        {/* MIDDLE AD UNIT */}
        <div className="max-w-7xl mx-auto px-4">
          <AdUnit />
        </div>

        <section id="compare" className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <article className="bg-neuBg rounded-3xl p-6 md:p-8 shadow-neu">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-neuDark"><Scale className="text-neuGreen" /> State Matchup</h2>
            <div className="flex gap-4 mb-8">
              <select className="w-1/2 bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-sm outline-none" value={compStateA} onChange={(e)=>setCompStateA(e.target.value)}>
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="w-1/2 bg-neuBg shadow-neu-inset rounded-xl p-4 font-bold text-sm outline-none" value={compStateB} onChange={(e)=>setCompStateB(e.target.value)}>
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
        </section>

        <section id="faqs" className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-black mb-10 text-center flex items-center justify-center gap-3 text-neuDark">
            <HelpCircle className="text-neuGreen" /> Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <article key={idx} className="bg-neuBg rounded-2xl shadow-neu overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                  className="w-full px-6 py-6 flex justify-between items-center text-left focus:outline-none"
                >
                  <span className="font-bold text-neuDark">{faq.q}</span>
                  <div className={`p-2 rounded-full shadow-neu transition-transform duration-300 ${openFaq === idx ? 'rotate-180 shadow-neu-inset' : ''}`}>
                    <ChevronDown className="h-5 w-5 text-neuGreen" />
                  </div>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed border-t border-[#d1d9d3] pt-4">
                    {faq.a}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* BOTTOM AD UNIT */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <AdUnit />
      </div>

      <footer className="bg-neuBg shadow-[0_-5px_15px_rgba(209,217,211,0.5)] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-neuGreen fill-neuGreen" />
              <span className="font-black text-neuDark tracking-widest uppercase">VidyutCalc</span>
            </div>
            <p>© {new Date().getFullYear()} VidyutCalc India. Designed with Neumorphism.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
