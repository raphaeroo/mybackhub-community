import { Author } from "./author";
import { Category } from "./category";

export type Post = {
  id: string;
  title: string;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  likes: number;
};

export type PostCategory = Post & Category;