import { UserResponse } from "~/types/user";
import { APP_API } from "../api";
import { Category } from "~/types/category";
import { PostAuthor, PostCategory } from "~/types/post";
import { Comment } from "~/types/comment";

export enum QueryKeys {
  UserData = "fetchUserData",
  LoadCategories = "loadCategories",
  LoadPostsByCategory = "loadPostsByCategory",
  LoadPost = "loadPost",
  LoadCommentsByPostId = "loadCommentsByPostId",
  LoadPostByUser = "loadPostByUser",
  LoadBookmarksByUser = "loadBookmarksByUser",
}

export const fetchUserData = async (externalId: string) => {
  try {
    const { data } = await APP_API.get<UserResponse>(`/users/${externalId}`);
    let bookmarks: string[] = [];

    if (data.id) {
      const { data: bookmarksList } = await APP_API.get<string[]>(
        `/users/${data.id}/bookmarks`
      );

      bookmarks = bookmarksList || [];
    }
    return { ...data, bookmarks };
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
};

export const loadPostsByCategory = async (categoryId: string) => {
  try {
    const { data } = await APP_API.get<PostAuthor[]>(
      `/posts/category/${categoryId}`
    );
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to load posts by category"
    );
  }
};

export const loadPost = async (postId: string) => {
  try {
    const { data } = await APP_API.get<PostCategory>(`/posts/${postId}`);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to load post"
    );
  }
};

export const loadCommentsByPostId = async (postId: string) => {
  try {
    const { data } = await APP_API.get<Comment[]>(`/comments/post/${postId}`);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to load comments by post ID"
    );
  }
};

export const loadPostByUser = async (userId?: string) => {
  try {
    const { data } = await APP_API.get<PostCategory[]>(`/posts/user/${userId}`);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to load posts by user"
    );
  }
};

export const loadBookmarksByUser = async (userId?: string) => {
  try {
    const { data } = await APP_API.get<PostCategory[]>(
      `/posts/bookmarks/${userId}`
    );
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to load bookmarks by user"
    );
  }
};
