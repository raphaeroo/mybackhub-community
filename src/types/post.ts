import { Author } from "./author";
import { Category } from "./category";

export type PostAuthor = {
  id: string;
  title: string;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  likes: number;
  commentsCount: number;
};

export type PostCategory = {
  id: string;
  title: string;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  likes: number;
  category: Category
  commentsCount: number;
};