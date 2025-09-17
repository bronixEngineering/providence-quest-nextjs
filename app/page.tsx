import Header from "@/components/header";
import Hero from "@/components/hero";
import FeaturesSection from "@/components/features-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden">
        <Hero />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
