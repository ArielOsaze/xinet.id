import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { EcosystemReveal } from "@/components/sections/ecosystem-reveal";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { ProductStrip } from "@/components/sections/product-strip";
import { Philosophy } from "@/components/sections/philosophy";
import { WhatWeBuild } from "@/components/sections/what-we-build";
import { Stats } from "@/components/sections/stats";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Labs } from "@/components/sections/labs";
import { About } from "@/components/sections/about";
import { FinalCta } from "@/components/sections/final-cta";

/**
 * Xinet — single-page company site.
 *
 * Section order follows the motion hierarchy: the hero carries the strongest
 * animation, product cards carry moderate interaction, editorial sections use
 * simple reveals, and the footer is effectively still. The page calms down as
 * the visitor scrolls.
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex flex-col">
        <Hero />
        <EcosystemReveal />
        <FeaturedProducts />
        <ProductStrip />
        <Philosophy />
        <WhatWeBuild />
        <Stats />
        <HowItWorks />
        <Labs />
        <About />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
