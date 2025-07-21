export type Author = {
  id: string;
  externalId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  postsLiked: string[] | null;
  commentsLiked: string[] | null;
  createdAt: string;
  updatedAt: string;
};
