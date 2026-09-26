import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBand from "@/components/TrustBand";
import Features from "@/components/Features";
import Steps from "@/components/Steps";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <div className="top">
        <div className="w">
          <Navbar />
          <Hero />
        </div>
      </div>
      <TrustBand />
      <Features />
      <Steps />
      <FinalCTA />
      <Footer />
    </>
  );
}
