import { BookmarkResponse } from "~/types/bookmark";
import { APP_API } from "../api";
import { PostCategory } from "~/types/post";
import { UserResponse } from "~/types/user";

export type CreatePostData = {
  title: string;
  categoryId?: string;
  content: string;
  authorId?: string;
};

export type CreateCommentDto = {
  content: string;
  postId?: string;
  commentId?: string;
  userId?: string;
};

export type CreateUser = {
  externalId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
};

export const createUserByExternalId = async (user: CreateUser) => {
  try {
    const { data } = await APP_API.post<UserResponse>("/users", user);
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create user"
    );
  }
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

export const toggleLikePost = async (
  postId: string,
  action: "like" | "unlike",
  userId?: string
) => {
  try {
    const { data } = await APP_API.put<PostCategory>(
      `/posts/${action}/${postId}/${userId}`
    );
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to like post"
    );
  }
};

export const toggleLikeComment = async (
  commentId: string,
  action: "like" | "unlike",
  userId?: string
) => {
  try {
    const { data } = await APP_API.put<PostCategory>(
      `/comments/${action}/${commentId}/${userId}`
    );
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to like post"
    );
  }
};

export const commentOnContent = async ({
  content,
  postId,
  commentId,
  userId,
}: CreateCommentDto) => {
  try {
    const { data } = await APP_API.post<Comment>(`/comments`, {
      content,
      authorId: userId,
      postId,
      commentId,
    });
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to comment on post"
    );
  }
};

export const bookmarkPost = async ({
  postId,
  userId,
  include = true,
}: {
  postId: string;
  userId?: string;
  include?: boolean;
}) => {
  try {
    if (include) {
      const { data } = await APP_API.post<BookmarkResponse>(
        `/posts/bookmark/${postId}/${userId}`
      );
      return data;
    }

    const { data } = await APP_API.delete<BookmarkResponse>(
      `/posts/bookmark/${postId}/${userId}`
    );
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to bookmark post"
    );
  }
};
