export type UserResponse = {
  id: string;
  externalId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  postsLiked: string[];
  commentsLiked: string[];
  createdAt: string;
  updatedAt: string;
  bookmarks: string[]; // Array of post IDs bookmarked by the user
};
