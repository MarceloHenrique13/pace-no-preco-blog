import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "./site";
import type { Post } from "./schema";

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedAt?: Date;
  updatedAt?: Date;
};

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
  publishedAt,
  updatedAt,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image ?? "/images/og-default.svg");
  const fullTitle =
    title === siteConfig.name ? title : `${title} | ${siteConfig.name}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      languages: { "pt-BR": url },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedAt ? { publishedTime: publishedAt.toISOString() } : {}),
      ...(updatedAt ? { modifiedTime: updatedAt.toISOString() } : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title: fullTitle,
      description,
      images: [ogImage],
    },
    other: {
      "geo.region": siteConfig.country,
      "geo.placename": "Brasil",
    },
  };
}

export function postMetadata(post: Post): Metadata {
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
    type: "article",
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt ?? post.publishedAt,
  });
}

function organizationEntity() {
  return {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(siteConfig.logoPath),
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "pt-BR",
    description: siteConfig.description,
    publisher: organizationEntity(),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    ...organizationEntity(),
    description: siteConfig.description,
    sameAs: [] as string[],
  };
}

export function articleJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: [absoluteUrl(post.coverImage)],
    datePublished: post.publishedAt.toISOString(),
    dateModified: (post.updatedAt ?? post.publishedAt).toISOString(),
    inLanguage: "pt-BR",
    author: {
      "@type": "Organization",
      name: siteConfig.author,
      url: siteConfig.url,
    },
    publisher: organizationEntity(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
  };
}

export function breadcrumbJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: absoluteUrl("/blog"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: absoluteUrl(`/blog/${post.slug}`),
      },
    ],
  };
}

export function itemListJsonLd(post: Post) {
  if (!post.shoes.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: post.title,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: post.shoes.length,
    itemListElement: [...post.shoes]
      .sort((a, b) => a.rank - b.rank)
      .map((shoe) => ({
        "@type": "ListItem",
        position: shoe.rank,
        name: shoe.name,
        url: shoe.affiliateUrl,
        image: absoluteUrl(shoe.image),
      })),
  };
}

export function faqJsonLd(post: Post) {
  if (!post.faq.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
