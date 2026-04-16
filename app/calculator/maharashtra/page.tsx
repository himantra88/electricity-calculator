// app/calculator/[state]/page.tsx
import { notFound } from 'next/navigation';
import ElectricityCalculator from '../../../components/ElectricityCalculator';
import { stateSlugs, getStateBySlug } from '../../../lib/statesData';
import { Metadata } from 'next';

export async function generateStaticParams() {
  return stateSlugs.map((state) => ({
    state: state.slug,
  }));
}

export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const stateData = getStateBySlug(params.state);
  
  if (!stateData) {
    return { title: 'State Not Found' };
  }

  return {
    title: `${stateData.name} Electricity Bill Calculator | Latest Tariff Slabs 2024`,
    description: `Calculate your electricity bill in ${stateData.name}. Check the latest domestic and commercial per-unit rates, fixed charges, and FPPCA surcharges.`,
    alternates: {
      canonical: `https://www.yourdomain.com/calculator/${params.state}` 
    }
  };
}

export default function StateCalculatorPage({ params }: { params: { state: string } }) {
  const stateData = getStateBySlug(params.state);

  if (!stateData) {
    notFound();
  }

  return (
    <main>
      <div className="bg-neuBg pt-8 text-center px-4">
         <h1 className="sr-only">{stateData.name} Electricity Bill Calculator</h1>
         <span className="bg-neuBg shadow-neu-inset px-5 py-2.5 rounded-full text-neuGreen font-black text-xs tracking-[0.2em] uppercase border border-[#e2e8e4]">
           📍 {stateData.name} Tariff Portal
         </span>
      </div>
      
      <ElectricityCalculator initialState={stateData.name} />
    </main>
  );
}
