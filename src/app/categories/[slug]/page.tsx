"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  Bookmark,
  DotIcon,
  ThumbsUpIcon,
  MessageCircle,
  SearchIcon,
  CheckIcon,
  ClipboardListIcon,
  Loader,
  BookmarkCheck,
} from "lucide-react";
import dayjs from "dayjs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { CategoryOrder } from "~/constants";
import { Badge } from "~/components/ui/badge";
import { NewTopic } from "~/components/new-topic";
import { useMutation, useQuery } from "@tanstack/react-query";
import { loadPostsByCategory, QueryKeys } from "~/core/api/queries";
import { PostAuthor } from "~/types/post";
import { LexicalRenderer } from "~/components/lexical-renderer";
import { bookmarkPost, createPost } from "~/core/api/mutations";
import { toast } from "sonner";
import { useMe } from "~/Contexts/meContext";

export default function Page() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { me, refetch: refetchMe } = useMe();
  const [topics, setTopics] = useState<PostAuthor[]>([]);
  const { data, error, isLoading, refetch } = useQuery<PostAuthor[]>({
    queryKey: [QueryKeys.LoadPostsByCategory, searchParams.get("categoryId")],
    queryFn: () => loadPostsByCategory(searchParams.get("categoryId") || ""), // Ensure categoryId is a string
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { isError, isPending, mutate, isSuccess } = useMutation({
    mutationFn: createPost,
  });

  const { mutate: bookmarkMutate } = useMutation({
    mutationFn: bookmarkPost,
    onSuccess: () => {
      refetchMe();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to bookmark post"
      );
    },
  });

  const [categoryOrder, setCategoryOrder] = useState<CategoryOrder>(
    CategoryOrder.MostRecent
  );

  useEffect(() => {
    if (isError) {
      toast.error("Failed to disconnect application. Please try again later.");
    }

    if (isSuccess) {
      toast.success("Application disconnected successfully.");
      refetch();
    }
  }, [isError, isSuccess, refetch]);

  const handleOrderChange = (order: CategoryOrder) => {
    setCategoryOrder(order);

    if (!data || data.length <= 1) return;

    switch (order) {
      case CategoryOrder.MostRecent:
        setTopics((prev) =>
          [...prev].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
        break;
      case CategoryOrder.MostLiked:
        setTopics((prev) => [...prev].sort((a, b) => b.likes - a.likes));
        break;
      case CategoryOrder.MostComments:
        setTopics((prev) =>
          [...prev].sort((a, b) => b.commentsCount - a.commentsCount)
        );
        break;
    }
  };

  useEffect(() => {
    if (!isLoading && data) {
      setTopics(data);
    }
  }, [isLoading, data]);

  if (isLoading || isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">
          Error loading application, please try again later.{" "}
        </p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
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
              <BreadcrumbLink href="/">Categories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-tertiary font-medium">
                {searchParams.get("title") || "Category"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-4">
        <h4 className="font-normal text-2xl mb-2">
          Topics about{" "}
          <span className="font-medium text-tertiary">
            {searchParams.get("title")}
          </span>
        </h4>
      </div>
      <div className="flex flex-col md:flex-row mt-8">
        <div className="flex-7 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pr-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-[400px]">
              <Input
                startIcon={
                  <SearchIcon
                    width={18}
                    height={18}
                    className="pointer-events-none"
                  />
                }
                placeholder="Search topics..."
                className="w-full"
                type="search"
              />
            </div>
            <p>Listing {topics.length} topics</p>
          </div>

          <div className="gap-4 flex flex-col min-h-[400px]">
            {topics.map((topic: PostAuthor) => (
              <Link
                key={topic.id}
                href={`/topic/${topic.id}?categoryName=${encodeURIComponent(
                  searchParams.get("title") || "Category"
                )}&categoryId=${searchParams.get(
                  "categoryId"
                )}&from=${pathname}`}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <CardHeader className="w-full">
                        <CardTitle>{topic.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="line-clamp-3 text-sm">
                        <LexicalRenderer content={topic.content} />
                      </CardContent>
                    </div>
                    <div className="pr-2">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (me?.bookmarks.includes(topic.id)) {
                            bookmarkMutate({
                              postId: topic.id,
                              userId: me?.id,
                              include: false,
                            });
                            toast.success("Post removed from bookmarks.");
                          } else {
                            bookmarkMutate({
                              postId: topic.id,
                              userId: me?.id,
                            });
                            toast.success("Post saved to bookmarks.");
                          }
                        }}
                      >
                        {me?.bookmarks.includes(topic.id) ? (
                          <BookmarkCheck className="text-orange-500" />
                        ) : (
                          <Bookmark />
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardFooter className="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center pt-2">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <div className="flex items-center gap-2 mb-2 md:mb-0">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="font-medium">
                            {topic.author.firstName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{topic.author.firstName}</p>
                      </div>
                      <div className="flex items-center md:items-center gap-2 text-xs text-gray-500">
                        <DotIcon className="text-gray-300 hidden md:block" />
                        <p className="text-xs text-gray-500">
                          {dayjs(topic.createdAt).format("MM/DD/YYYY")}
                        </p>
                        <DotIcon className="text-gray-300" />
                        <Badge variant="outline">
                          <ClipboardListIcon /> {searchParams.get("title")}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 font-medium mt-4 md:mt-0">
                      <div className="flex items-center">
                        <ThumbsUpIcon className="h-4 w-4" />
                        <span className="ml-1 text-xs">
                          {topic.likes} likes
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4" />
                        <span className="ml-1 text-xs">
                          {topic.commentsCount} comments
                        </span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex-2 pt-4 md:pl-4">
          <NewTopic
            onSubmit={(data) =>
              mutate({
                ...data,
                content: JSON.stringify(data.content),
              })
            }
            currentCategoryId={searchParams.get("categoryId") || undefined}
          />
          <Separator className="my-12" />
          <div className="flex flex-col gap-4 text-left">
            <p className="text-sm font-medium">Order By</p>
            <Button
              className="justify-between"
              variant={
                categoryOrder === CategoryOrder.MostRecent
                  ? "default"
                  : "outline"
              }
              onClick={() => handleOrderChange(CategoryOrder.MostRecent)}
            >
              Most recent
              {categoryOrder === CategoryOrder.MostRecent && <CheckIcon />}
            </Button>
            <Button
              className="justify-between"
              variant={
                categoryOrder === CategoryOrder.MostLiked
                  ? "default"
                  : "outline"
              }
              onClick={() => handleOrderChange(CategoryOrder.MostLiked)}
            >
              Most Liked
              {categoryOrder === CategoryOrder.MostLiked && <CheckIcon />}
            </Button>
            <Button
              className="justify-between"
              variant={
                categoryOrder === CategoryOrder.MostComments
                  ? "default"
                  : "outline"
              }
              onClick={() => handleOrderChange(CategoryOrder.MostComments)}
            >
              Most comments
              {categoryOrder === CategoryOrder.MostComments && <CheckIcon />}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
