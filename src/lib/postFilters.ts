interface FilterablePost {
  title: string;
  description: string;
  project?: string;
}

export function filterPostsBySearch<T extends FilterablePost>(
  posts: T[],
  query: string
): T[] {
  if (!query.trim()) {
    return posts;
  }

  const lowerQuery = query.toLowerCase();

  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.description.toLowerCase().includes(lowerQuery)
  );
}
