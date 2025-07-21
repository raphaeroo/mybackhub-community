"use client";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookmarkIcon,
  DotIcon,
  ThumbsUpIcon,
  MessageCircle,
} from "lucide-react";
import { RichTextLexicalRenderer } from "@webiny/react-rich-text-lexical-renderer";

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

export default function Page({}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const categoryName = searchParams.get("categoryName") || "General";
  const from = searchParams.get("from") || "/";
  const categoryId = searchParams.get("categoryId") || "1"; // Default to

  const {
    data: currentTopic,
    error: postError,
    isLoading: postLoading,
  } = useQuery<PostCategory>({
    queryKey: [QueryKeys.LoadPost, pathname.split("/").pop() || ""],
    queryFn: () => loadPost(pathname.split("/").pop() || ""),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const {
    data: currentComments,
    error: commentsError,
    isLoading: commentsLoading,
  } = useQuery<Comment[]>({
    queryKey: [QueryKeys.LoadCommentsByPostId, pathname.split("/").pop() || ""],
    queryFn: () => loadCommentsByPostId(pathname.split("/").pop() || ""),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Organize comments into hierarchical structure
  const organizeComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment & { replies: Comment[] }>();
    const rootComments: (Comment & { replies: Comment[] })[] = [];

    // First pass: create map of all comments with replies array
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
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

  const organizedComments = organizeComments(currentComments || []);

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
            <div className="flex items-center gap-4 text-xs">
              <button className="flex items-center gap-1 text-gray-500 hover:text-primary">
                <ThumbsUpIcon className="w-3 h-3" />
                <span>{comment.likes}</span>
              </button>
              {comment.parentComment === null && (
                <button className="flex items-center gap-1 text-gray-500 hover:text-primary">
                  <MessageCircle className="w-3 h-3" />
                  <span>Reply</span>
                </button>
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
          {currentTopic?.content && <RichTextLexicalRenderer value={JSON.parse(currentTopic.content)} />}
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
                : `${dayjs(currentTopic?.updatedAt).format("HH:mm")} ago`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 font-medium mt-4 md:mt-0">
          <Button variant="outline">
            <ThumbsUpIcon className="h-4 w-4" />
            Like
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
          <AvatarFallback className="font-medium">R</AvatarFallback>
        </Avatar>
        <Input className="w-full" />
        <Button>Post</Button>
      </div>
      <Separator />
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">
          Comments ({currentComments?.length})
        </h3>
        {organizedComments.length > 0 ? (
          <div className="space-y-2">
            {organizedComments.map((comment) => (
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
