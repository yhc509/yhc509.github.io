interface FilterablePost {
  title: string;
  description: string;
  tags: string[];
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
      post.description.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export function filterPostsByProjects<T extends FilterablePost>(
  posts: T[],
  selectedProjects: string[]
): T[] {
  if (selectedProjects.length === 0) {
    return posts;
  }

  return posts.filter(
    (post) => post.project && selectedProjects.includes(post.project)
  );
}
