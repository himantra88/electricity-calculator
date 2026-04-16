// app/calculator/[state]/page.tsx
import { notFound } from 'next/navigation';
import ElectricityCalculator from '@/components/ElectricityCalculator';
import { stateSlugs, getStateBySlug } from '@/lib/statesData';
import { Metadata } from 'next';

// 1. Generate Static Pages at Build Time
export async function generateStaticParams() {
  return stateSlugs.map((state) => ({
    state: state.slug,
  }));
}

// 2. Generate Dynamic SEO Meta Tags per State
export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const stateData = getStateBySlug(params.state);
  
  if (!stateData) {
    return { title: 'State Not Found' };
  }

  return {
    title: `${stateData.name} Electricity Bill Calculator | Latest Tariff Slabs 2024`,
    description: `Calculate your electricity bill in ${stateData.name}. Check the latest domestic and commercial per-unit rates, fixed charges, and FPPCA surcharges.`,
    alternates: {
      canonical: `https://www.yourdomain.com/calculator/${params.state}` // Replace with actual domain
    }
  };
}

// 3. Render the Page
export default function StateCalculatorPage({ params }: { params: { state: string } }) {
  const stateData = getStateBySlug(params.state);

  if (!stateData) {
    notFound();
  }

  return (
    <main>
      {/* Optional: A small SEO-friendly H1 tag wrapper above the calculator */}
      <div className="bg-neuBg pt-8 text-center px-4">
         <h1 className="sr-only">{stateData.name} Electricity Bill Calculator</h1>
         <span className="bg-neuBg shadow-neu-inset px-5 py-2.5 rounded-full text-neuGreen font-black text-xs tracking-[0.2em] uppercase border border-[#e2e8e4]">
           📍 {stateData.name} Tariff Portal
         </span>
      </div>
      
      {/* Pass the state name to the client component so it pre-selects the dropdown */}
      <ElectricityCalculator initialState={stateData.name} />
    </main>
  );
}