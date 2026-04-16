// app/calculator/[state]/page.tsx
import { notFound } from 'next/navigation';
import ElectricityCalculator from '../../../components/ElectricityCalculator';
import { statesList, globalTariffData, stateSlugs, getStateBySlug } from '../../../lib/statesData';

// ... (generateStaticParams and generateMetadata functions remain the same) ...

export default function StateCalculatorPage({ params }: { params: { state: string } }) {
  const stateData = getStateBySlug(params.state);

  if (!stateData) notFound();

  return (
    <main>
      <div className="bg-neuBg pt-8 text-center px-4">
         <h1 className="sr-only">{stateData.name} Electricity Bill Calculator</h1>
         <span className="bg-neuBg shadow-neu-inset px-5 py-2.5 rounded-full text-neuGreen font-black text-xs tracking-[0.2em] uppercase border border-[#e2e8e4]">
           📍 {stateData.name} Tariff Portal
         </span>
      </div>
      
      {/* Pass the dynamic JSON data here too */}
      <ElectricityCalculator 
        initialState={stateData.name} 
        statesList={statesList}
        tariffData={globalTariffData}
      />
    </main>
  );
}
