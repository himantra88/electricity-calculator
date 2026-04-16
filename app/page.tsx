// app/page.tsx
import ElectricityCalculator from '../components/ElectricityCalculator';
import { statesList, globalTariffData } from '../lib/statesData';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VidyutCalc | India Electricity Bill Calculator 2024',
  description: 'Instantly calculate your electricity bill for all 36 Indian states and UTs.',
};

export default function HomePage() {
  return (
    // We pass the dynamic JSON data directly into the component here
    <ElectricityCalculator 
      initialState="Maharashtra" 
      statesList={statesList}
      tariffData={globalTariffData}
    />
  );
}
