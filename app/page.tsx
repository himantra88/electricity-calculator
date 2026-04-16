// app/page.tsx
import ElectricityCalculator from '@/components/ElectricityCalculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VidyutCalc | India Electricity Bill Calculator 2024',
  description: 'Instantly calculate your electricity bill for all 36 Indian states and UTs. Compare domestic and commercial tariff slabs, fixed charges, and taxes.',
  alternates: {
    canonical: 'https://electricity-calculator-liard.vercel.app/', // Replace with your actual domain
  }
};

export default function HomePage() {
  return (
    <ElectricityCalculator initialState="Maharashtra" />
  );
}
