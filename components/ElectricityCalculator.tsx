// components/ElectricityCalculator.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, Zap, Lightbulb, ShieldCheck, MapPin, 
  Menu, X, BarChart3, Scale, Info, HelpCircle, ChevronDown, 
  Home, Building2, TrendingUp, DollarSign, ListOrdered, FileSearch, TableProperties
} from 'lucide-react';
import type { TariffData, TariffDetails, Slab } from '../lib/statesData';

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

// ... (Keep the NeuSelect, AdUnit, energyTips, and faqs definitions here exactly as before) ...

export default function ElectricityCalculator({ 
  initialState = 'Maharashtra', 
  statesList, 
  tariffData 
}: ElectricityCalculatorProps) {
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [state, setState] = useState(initialState);
  const [connType, setConnType] = useState('Domestic');
  const [units, setUnits] = useState('');
  
  // Load initial tariff from the dynamic JSON prop
  const [tariff, setTariff] = useState<TariffDetails>(
    tariffData[state]?.[connType] || tariffData['Maharashtra']['Domestic']
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [billResult, setBillResult] = useState<BillResult | null>(null);

  // Widget States
  const [compStateA, setCompStateA] = useState('Maharashtra');
  const [compStateB, setCompStateB] = useState('Delhi');
  const [natAvgState, setNatAvgState] = useState('Maharashtra');
  const [lookupState, setLookupState] = useState('Maharashtra');
  const [tableState, setTableState] = useState('Maharashtra');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Sync tariff when dropdown changes
  useEffect(() => {
    if (tariffData[state]) {
      setTariff(tariffData[state][connType]);
      setBillResult(null); 
    }
  }, [state, connType, tariffData]);

  // ==========================================
  // GOVERNMENT TELESCOPIC BILLING ENGINE
  // ==========================================
  const calculateEngine = (calcUnits: number, calcTariff: TariffDetails): Omit<BillResult, 'consumed'> => {
    let remainingUnits = calcUnits;
    let totalEnergyCharge = 0;
    let prevLimit = 0;
    const slabBreakdown: SlabBreakdown[] = [];

    // 1. TELESCOPIC SLAB CALCULATION
    // The algorithm loops through the slabs. It subtracts the capacity of the current
    // slab from the remaining units. If units are left over, it moves to the next, 
    // more expensive slab.
    for (const slab of calcTariff.slabs) {
      if (remainingUnits <= 0) break;
      
      // Determine how many units fit in this specific tier
      const slabCapacity = slab.max === Infinity ? Infinity : slab.max - prevLimit;
      const unitsInThisSlab = Math.min(remainingUnits, slabCapacity);
      
      // Calculate cost for just this tier
      const cost = unitsInThisSlab * slab.rate;
      totalEnergyCharge += cost;
      
      slabBreakdown.push({ 
        range: `${prevLimit + 1} - ${slab.max === Infinity ? 'Above' : slab.max}`, 
        units: unitsInThisSlab, 
        rate: slab.rate, 
        cost: cost 
      });
      
      // Reduce remaining units and move to the next threshold
      remainingUnits -= unitsInThisSlab;
      prevLimit = slab.max;
    }
    
    // 2. SURCHARGES & TAXES (Applied exactly as Indian DISCOMs do)
    // FAC (Fuel Adjustment Charge) is multiplied by total units
    const facTotal = calcUnits * calcTariff.fac;
    
    // Duty Tax is a percentage applied to the SUM of Energy + Fixed + FAC charges
    const dutyTotal = (totalEnergyCharge + calcTariff.fixedCharge + facTotal) * (calcTariff.dutyPercent / 100);
    
    // 3. FINAL AGGREGATION
    const finalTotal = totalEnergyCharge + calcTariff.fixedCharge + calcTariff.meterRent + facTotal + dutyTotal;

    return { 
      totalEnergyCharge, 
      slabBreakdown, 
      finalTotal, 
      facTotal, 
      dutyTotal, 
      fixedCharge: calcTariff.fixedCharge, 
      meterRent: calcTariff.meterRent 
    };
  };

  const calculateBill = () => {
    const consumed = parseFloat(units);
    if (isNaN(consumed) || consumed < 0) return alert("Please enter valid units.");
    setBillResult({ consumed, ...calculateEngine(consumed, tariff) });
  };

  const handleTariffChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof TariffDetails) => {
    setTariff({ ...tariff, [field]: parseFloat(e.target.value) || 0 });
  };

  // Base parameters for visualizers
  const nationalAvg500 = 3500; 
  const selectedNatAvgState500 = calculateEngine(500, tariffData[natAvgState]?.Domestic || tariffData['Maharashtra'].Domestic).finalTotal;
  const compA500 = calculateEngine(500, tariffData[compStateA]?.Domestic || tariffData['Maharashtra'].Domestic).finalTotal;
  const compB500 = calculateEngine(500, tariffData[compStateB]?.Domestic || tariffData['Delhi'].Domestic).finalTotal;

  return (
      // ... REST OF THE UI REMAINS EXACTLY THE SAME ...
  )
}
