// lib/statesData.ts

export interface Slab {
  max: number;
  rate: number;
}

export interface TariffDetails {
  slabs: Slab[];
  fixedCharge: number;
  meterRent: number;
  dutyPercent: number;
  fac: number;
}

export interface TariffData {
  Domestic: TariffDetails;
  Commercial: TariffDetails;
  [key: string]: TariffDetails;
}

export const statesList = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const stateSlugs = statesList.map(state => ({
  name: state,
  slug: state.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')
}));

export function getStateBySlug(slug: string) {
  return stateSlugs.find(s => s.slug === slug);
}

// Build the dynamic JSON object for all states
export const globalTariffData: Record<string, TariffData> = {};

const standardDomesticSlabs: Slab[] = [{ max: 100, rate: 3.50 }, { max: 300, rate: 5.50 }, { max: 500, rate: 7.50 }, { max: Infinity, rate: 8.50 }];
const standardCommercialSlabs: Slab[] = [{ max: 200, rate: 7.50 }, { max: Infinity, rate: 9.50 }];

statesList.forEach((state, index) => {
  const variation = (index % 7); 
  globalTariffData[state] = { 
    Domestic: { 
      slabs: [...standardDomesticSlabs],
      fixedCharge: 40 + (variation * 10),
      meterRent: 10 + (variation * 2),
      dutyPercent: 4 + variation,
      fac: parseFloat((0.10 + (variation * 0.05)).toFixed(2))
    }, 
    Commercial: { 
      slabs: [...standardCommercialSlabs],
      fixedCharge: 150 + (variation * 25),
      meterRent: 20 + (variation * 5),
      dutyPercent: 8 + variation,
      fac: parseFloat((0.20 + (variation * 0.08)).toFixed(2))
    } 
  };
});
