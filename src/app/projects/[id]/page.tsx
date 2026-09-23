import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import {
  PRODUCTS,
  PROJECT_DETAILS,
  getProduct,
  getProjectDetail,
} from "@/lib/content";

/**
 * /projects/<id> — one page per shipped product.
 *
 * Statically generated for every known id, and `dynamicParams = false` means an
 * unknown id 404s instead of rendering an empty shell. Metadata is generated per
 * product so each page has its own title, description, canonical and OG image.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  const detail = getProjectDetail(id);
  if (!product || !detail) return {};

  const title = `${product.name} · ${detail.tagline.en}`;
  const description = `${detail.tagline.en} ${detail.problem.en}`.slice(0, 300);
  const url = `https://xinet.id/projects/${product.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Xinet",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  const detail = getProjectDetail(id);

  // Unknown id, or a product with no detail written yet.
  if (!product || !detail) notFound();

  // The next product in the list, wrapping around, so every page links onward.
  const idx = PROJECT_DETAILS.findIndex((p) => p.id === id);
  const nextDetail = PROJECT_DETAILS[(idx + 1) % PROJECT_DETAILS.length];
  const nextProduct = getProduct(nextDetail.id) ?? null;

  return (
    <>
      <Navbar />
      <main id="main">
        <ProjectDetailView
          product={product}
          detail={detail}
          nextProduct={nextProduct}
          nextDetail={nextDetail}
        />
      </main>
      <Footer />
    </>
  );
}
