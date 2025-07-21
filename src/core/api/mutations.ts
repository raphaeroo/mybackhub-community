import { APP_API } from "../api";
import { PostCategory } from "~/types/post";

export type CreatePostData = {
  title: string;
  categoryId?: string;
  content: string;
  authorId?: string;
};

export const createPost = async (postData: CreatePostData) => {
  try {
    const { data } = await APP_API.post<PostCategory>("/posts", postData);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create post"
    );
  }
};
