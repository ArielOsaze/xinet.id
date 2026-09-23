import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Next.js re-encodes every image it serves, and its default quality is 75.
     * For these product screenshots that is the problem: they are UI captures
     * — large flat areas plus a lot of small sharp text — and lossy WebP at 75
     * measurably softens the type (edge sharpness 2.59 against 2.92 for the
     * untouched source). The page then undersells the products, because the
     * screenshots are the evidence.
     *
     * 95 is used instead: near-lossless for this content while still far
     * smaller than shipping the originals.
     *
     * The `qualities` allow-list is required — Next.js only accepts qualities
     * listed here, which is why the default kept being applied no matter what
     * the components requested.
     */
    qualities: [75, 90, 95, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2048, 3840],
  },
};

export default nextConfig;
