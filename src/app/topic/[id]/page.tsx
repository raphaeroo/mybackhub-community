"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookmarkIcon,
  DotIcon,
  ThumbsUpIcon,
  MessageCircle,
} from "lucide-react";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { loadCommentsByPostId, loadPost, QueryKeys } from "~/core/api/queries";
import { PostCategory } from "~/types/post";

import { Loader } from "~/components/loader";
import { Comment } from "~/types/comment";
import { LexicalRenderer } from "~/components/lexical-renderer";
import { useMe } from "~/Contexts/meContext";
import { useMemo, useState } from "react";
import {
  commentOnContent,
  toggleLikePost,
  CreateCommentDto,
  toggleLikeComment,
} from "~/core/api/mutations";
import { toast } from "sonner";

export default function Page({}) {
  const { me, refetch: refetchMe } = useMe();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [newComment, setNewComment] = useState<string | undefined>(undefined);
  const [newReply, setNewReply] = useState<string | undefined>(undefined);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);

  const categoryName = searchParams.get("categoryName") || "General";
  const from = searchParams.get("from") || "/";
  const categoryId = searchParams.get("categoryId") || "1"; // Default to

  const postId = pathname.split("/").pop() || "";

  const postLiked = useMemo(() => {
    if (!me?.postsLiked) {
      return false;
    }
    return me?.postsLiked.includes(postId);
  }, [me?.postsLiked, postId]);

  const {
    data: currentTopic,
    error: postError,
    isLoading: postLoading,
  } = useQuery<PostCategory>({
    queryKey: [QueryKeys.LoadPost, postId],
    queryFn: () => loadPost(postId),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const {
    data: currentComments,
    error: commentsError,
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useQuery<Comment[]>({
    queryKey: [QueryKeys.LoadCommentsByPostId, postId],
    queryFn: () => loadCommentsByPostId(postId),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const { mutate: likePostMutate } = useMutation({
    mutationFn: () =>
      toggleLikePost(postId, postLiked ? "unlike" : "like", me?.id),
    onSuccess: () => {
      if (!postLiked) {
        toast.success("Post liked successfully!");
      }
      refetchMe();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to like post"
      );
    },
  });

  const { mutate: likeCommentMutate } = useMutation({
    mutationFn: ({
      commentId,
      action,
    }: {
      commentId: string;
      action: "like" | "unlike";
    }) => toggleLikeComment(commentId, action, me?.id),
    onSuccess: () => {
      refetchMe();
      refetchComments();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to like comment"
      );
    },
  });

  const { mutate: commentMutate } = useMutation({
    mutationFn: (data: CreateCommentDto) => commentOnContent(data),
    onSuccess: () => {
      toast.success("Comment added successfully!");
      refetchComments();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to add comment"
      );
    },
  });

  // Organize comments into hierarchical structure
  const organizeComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment & { replies: Comment[] }>();
    const rootComments: (Comment & { replies: Comment[] })[] = [];

    // First pass: create map of all comments with replies array
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: comment.replies });
    });

    // Second pass: organize into hierarchy
    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;

      if (comment.parentComment === null) {
        // Root comment
        rootComments.push(commentWithReplies);
      } else {
        // Reply to another comment
        const parent = commentMap.get(comment.parentComment.id);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      }
    });

    return rootComments;
  };

  // Comment component for recursive rendering
  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: Comment & { replies?: Comment[] };
    depth?: number;
  }) => {
    const maxDepth = 1; // Limit nesting depth
    const actualDepth = Math.min(depth, maxDepth);

    // Use style for dynamic margin since Tailwind doesn't include all margin values
    const marginStyle =
      actualDepth > 0 ? { marginLeft: `${actualDepth * 24}px` } : {};

    return (
      <div
        style={marginStyle}
        className={`${
          actualDepth > 0 ? "border-l-2 border-gray-100 pl-4" : ""
        }`}
      >
        <div className="flex gap-3 py-4">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="font-medium">
              {comment.author.firstName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm">
                {comment.author.firstName} {comment.author.lastName}
              </p>
              <DotIcon className="w-3 h-3 text-gray-300" />
              <p className="text-xs text-gray-500">
                {dayjs(comment.createdAt).format("MMM DD, YYYY")}
              </p>
            </div>
            <p className="text-sm text-gray-700 mb-2 leading-relaxed">
              {comment.content}
            </p>
            <div className="flex flex-col md:flex-row items-start gap-4 text-xs">
              <Button
                variant="ghost"
                size="icon"
                className={`flex items-center gap-1 ${
                  me?.commentsLiked?.includes(comment.id)
                    ? "text-primary"
                    : "text-gray-500 hover:text-primary"
                }`}
                onClick={() =>
                  likeCommentMutate({
                    commentId: comment.id,
                    action: me?.commentsLiked?.includes(comment.id)
                      ? "unlike"
                      : "like",
                  })
                }
              >
                <ThumbsUpIcon className="w-3 h-3" />
                <span>{comment.likes}</span>
              </Button>
              {comment.parentComment === null && (
                <div className="flex-1">
                  {replyToCommentId === comment.id ? (
                    <div className="flex w-full items-start md:items-center gap-2 flex-col md:flex-row">
                      <Input
                        className="w-full"
                        autoFocus
                        type="text"
                        placeholder="Write a reply..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                      />
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <Button
                          onClick={() => {
                            if (!newReply || newReply.trim() === "") {
                              toast.error("Reply cannot be empty");
                              return;
                            }

                            commentMutate({
                              content: newReply,
                              commentId: comment.id,
                              userId: me?.id,
                            });
                            setNewReply("");
                            setReplyToCommentId(null);
                          }}
                        >
                          Comment
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-gray-500 hover:text-primary"
                          onClick={() => setReplyToCommentId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-gray-500 hover:text-primary"
                      onClick={() => setReplyToCommentId(comment.id)}
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Reply</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-0">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={actualDepth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const adjustFromName = (from: string | undefined) => {
    if (!from) return "Home";
    const parts = from.split("/");
    const name =
      parts.length > 1 ? parts[1][0].toUpperCase() + parts[1].slice(1) : "Home";

    if (name.includes("-")) {
      return name
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" ");
    }

    return name;
  };

  const adjustFromRoot = (from: string | undefined) => {
    if (!from) return "/";
    const parts = from.split("/");
    const root = parts.length > 1 ? `/${parts[1]}` : "/";

    if (root.includes("categories")) {
      return "/";
    }

    return root;
  };

  if (postLoading || commentsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (postError || commentsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">
          Error loading application, please try again later.{" "}
        </p>
        <p className="text-sm text-muted-foreground">
          {(postError || commentsError) instanceof Error
            ? (postError || commentsError)!.message
            : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  return (
    <section className="p-8">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={adjustFromRoot(from)}>
                {adjustFromName(from)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`${from}?categoryId=${categoryId}&title=${categoryName}`}
              >
                {categoryName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-tertiary font-medium">
                Topic
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-4">
        <h4 className="font-normal text-2xl mb-2">{currentTopic?.title}</h4>
        <div className="mb-4">
          {currentTopic?.content && (
            <LexicalRenderer content={currentTopic.content} />
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center py-4">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="font-medium">
                {currentTopic?.author.firstName[0]}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium">
              {currentTopic?.author.firstName} {currentTopic?.author.lastName}
            </p>
          </div>
          <div className="flex items-center md:items-center gap-2 text-xs text-gray-500">
            <DotIcon className="text-gray-300 hidden md:block" />
            <p className="text-xs text-gray-500">
              {dayjs(currentTopic?.createdAt).format("MM/DD/YYYY")}
            </p>
            <DotIcon className="text-gray-300" />
            <p className="text-xs text-gray-500">
              Last Activity at{" "}
              {dayjs().diff(dayjs(currentTopic?.updatedAt), "days") > 0
                ? dayjs(currentTopic?.updatedAt).format("MM/DD/YYYY")
                : `${dayjs(currentTopic?.updatedAt).format("HH:mm")}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 font-medium mt-4 md:mt-0">
          <Button
            variant={postLiked ? "default" : "outline"}
            onClick={() => likePostMutate()}
          >
            <ThumbsUpIcon className="h-4 w-4" />
            {postLiked ? 'Liked' : 'Like'}
          </Button>
          <Button variant="outline">
            <BookmarkIcon className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex gap-2 md:gap-6 items-center justify-between my-4">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="font-medium">
            {me?.firstName[0]}
          </AvatarFallback>
        </Avatar>
        <Input
          className="w-full"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          onClick={() => {
            if (!newComment || newComment.trim() === "") {
              toast.error("Comment cannot be empty");
              return;
            }

            commentMutate({
              content: newComment,
              postId: currentTopic?.id,
              userId: me?.id,
            });
            setNewComment("");
          }}
        >
          Post
        </Button>
      </div>
      <Separator />
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">
          Comments ({currentComments?.length})
        </h3>
        {currentComments && organizeComments(currentComments).length > 0 ? (
          <div className="space-y-2">
            {organizeComments(currentComments).map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </section>
  );
}
