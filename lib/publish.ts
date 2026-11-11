export function isPostPublic(
  post: { slug: string; draft: boolean },
  publishedSlugs: Set<string>,
): boolean {
  if (publishedSlugs.has(post.slug)) return true;
  if (!post.draft) return true;
  return false;
}

export function allShoesHaveOverrides(
  shoeNames: string[],
  overrideNames: Set<string>,
): boolean {
  return shoeNames.every((name) => overrideNames.has(name));
}
