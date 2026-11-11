import type { MDXComponents } from "mdx/types";
import { AffiliateCta } from "./affiliate-cta";
import { ShoeCard } from "./shoe-card";

export const mdxComponents: MDXComponents = {
  AffiliateCta,
  ShoeCard,
  h2: (props) => (
    <h2
      className="font-display mt-10 text-2xl italic tracking-tight text-ink sm:mt-12 sm:text-3xl"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 text-lg font-semibold tracking-tight text-ink sm:text-xl"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mt-4 text-base leading-relaxed text-muted" {...props} />
  ),
  ul: (props) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-muted" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted" {...props} />
  ),
  a: (props) => (
    <a
      className="font-medium text-court underline-offset-2 hover:underline break-words"
      {...props}
    />
  ),
};
