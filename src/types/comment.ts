type ParentComment = {
  id: string
  content: string
  likes: number;
  createdAt: string
  updatedAt: string
} | null;

export type Comment = {
  id: string;
  post: {
    id: string;
  };
  parentComment: ParentComment;
  replies: Comment[];
  author: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
};
