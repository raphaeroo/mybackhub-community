import { UserResponse } from "~/types/user";
import { APP_API } from "../api";
import { Category } from "~/types/category";
import { Post, PostCategory } from "~/types/post";
import { Comment } from "~/types/comment";

export enum QueryKeys {
  UserData = "fetchUserData",
  LoadCategories = "loadCategories",
  LoadPostsByCategory = "loadPostsByCategory",
  LoadPost = "loadPost",
  LoadCommentsByPostId = "loadCommentsByPostId",
}

export const fetchUserData = async (externalId: string) => {
  try {
    const { data } = await APP_API.get<UserResponse>(`/users/${externalId}`);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch user data"
    );
  }
};

export const loadCategories = async () => {
  try {
    const { data } = await APP_API.get<Category[]>("/categories");
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to load categories"
    );
  }
}

export const loadPostsByCategory = async (categoryId: string) => {
  try {
    const { data } = await APP_API.get<Post[]>(`/posts/category/${categoryId}`);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to load posts by category"
    );
  }
}

export const loadPost = async (postId: string) => {
  try {
    const { data } = await APP_API.get<PostCategory>(`/posts/${postId}`);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to load post"
    );
  }
}

export const loadCommentsByPostId = async (postId: string) => {
  try {
    const { data } = await APP_API.get<Comment[]>(`/comments/post/${postId}`);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to load comments by post ID"
    );
  }
}