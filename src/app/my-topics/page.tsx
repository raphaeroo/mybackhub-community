"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Trash2,
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import Link from "next/link";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

import { useQueryString } from "~/utils";
import { CategoryOrder } from "~/constants";
import { Badge } from "~/components/ui/badge";
import { NewTopic } from "~/components/new-topic";
import { PostCategory } from "~/types/post";
import { useMutation, useQuery } from "@tanstack/react-query";
import { loadCategories, loadPostByUser, QueryKeys } from "~/core/api/queries";
import { useMe } from "~/Contexts/meContext";
import { Category } from "~/types/category";
import { LexicalRenderer } from "~/components/lexical-renderer";
import { bookmarkPost, createPost, deletePost } from "~/core/api/mutations";

function MyTopicsContent() {
  const pathname = usePathname();
  const router = useRouter();

  const { createQueryString } = useQueryString();
  const { me, refetch: refetchMe } = useMe();

  const [topics, setTopics] = useState<PostCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const { data, error, isLoading, refetch } = useQuery<PostCategory[]>({
    queryKey: [QueryKeys.LoadPostByUser, me?.id],
    queryFn: () => loadPostByUser(me?.id),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { mutate } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      toast.success("Post created successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create post",
      );
    },
  });

  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesIsLoading,
  } = useQuery<Category[]>({
    queryKey: [QueryKeys.LoadCategories],
    queryFn: loadCategories,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { mutate: bookmarkMutate } = useMutation({
    mutationFn: bookmarkPost,
    onSuccess: () => {
      refetchMe();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove bookmark",
      );
    },
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete post",
      );
    },
  });

  const [categoryOrder, setCategoryOrder] = useState<CategoryOrder | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  const handleOrderChange = useCallback(
    (order: CategoryOrder) => {
      setCategoryOrder(order);

      if (!topics) return;

      switch (order) {
        case CategoryOrder.MostRecent:
          setTopics((prev) =>
            [...prev].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
          );
          break;
        case CategoryOrder.MostLiked:
          setTopics((prev) => [...prev].sort((a, b) => b.likes - a.likes));
          break;
        case CategoryOrder.MostComments:
          setTopics((prev) =>
            [...prev].sort((a, b) => b.commentsCount - a.commentsCount),
          );
          break;
      }
    },
    [topics],
  );

  useEffect(() => {
    if (!isLoading && data) {
      let filteredTopics = data;

      // Filter by category if categoryId is present
      if (categoryId && categoryId !== "all") {
        filteredTopics = data.filter(
          (topic) => topic.category.id.toString() === categoryId,
        );
      }

      // Filter by search term
      if (searchTerm) {
        filteredTopics = filteredTopics.filter(
          (topic) =>
            topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            topic.content.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      setTopics(filteredTopics);
    }
  }, [isLoading, data, categoryId, searchTerm]);

  if (isLoading || categoriesIsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error || categoriesError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">
          Error loading application, please try again later.{" "}
        </p>
        <p className="text-sm text-muted-foreground">
          {(categoriesError || error) instanceof Error
            ? (categoriesError || error)?.message
            : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  return (
    <section className="p-8">
      <h4 className="font-medium text-2xl mb-2">My Topics</h4>
      <span className="font-normal text-tertiary">
        Create, edit, and keep track of your community topics with ease.
      </span>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p>Listing {topics.length} topics</p>
          </div>

          <div className="gap-4 flex flex-col min-h-[400px]">
            {topics.map((topic: PostCategory) => (
              <Link
                key={topic.id}
                href={`/topic/${topic.id}?categoryName=${encodeURIComponent(
                  topic.category.name,
                )}&categoryId=${topic.category.id}&from=${pathname}`}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <CardHeader className="w-full">
                        <CardTitle>{topic.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="line-clamp-2 text-sm">
                        <LexicalRenderer content={topic.content} />
                      </CardContent>
                    </div>
                    <div className="pr-6 flex gap-2">
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
                      <AlertDialog
                        open={deleteDialogOpen === topic.id}
                        onOpenChange={(open) =>
                          setDeleteDialogOpen(open ? topic.id : null)
                        }
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDeleteDialogOpen(topic.id);
                            }}
                          >
                            <Trash2 className="text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this post? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => {
                                deleteMutate(topic.id);
                                setDeleteDialogOpen(null);
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardFooter className="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center pt-2">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <div className="flex items-center gap-2 mb-2 md:mb-0">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="font-medium">
                            {me?.firstName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium">
                          {me?.firstName} {me?.lastName}
                        </p>
                      </div>
                      <div className="flex items-center md:items-center gap-2 text-xs text-gray-500">
                        <DotIcon className="text-gray-300 hidden md:block" />
                        <p className="text-xs text-gray-500">
                          {dayjs(topic.createdAt).format("MM/DD/YYYY")}
                        </p>
                        <DotIcon className="text-gray-300" />
                        <Badge variant="outline">
                          <ClipboardListIcon /> {topic.category.name}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 font-medium mt-4 md:mt-0">
                      <div
                        className={`flex items-center ${me?.postsLiked?.includes(topic.id) ? "text-primary" : ""}`}
                      >
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
        <div className="flex-2 md:pl-4">
          <NewTopic
            showCategorySelect
            categories={categoriesData}
            onSubmit={(data) =>
              mutate({
                ...data,
                content: JSON.stringify(data.content),
              })
            }
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
          <Separator className="my-12" />
          <p className="text-sm font-medium pb-4">Categories</p>
          <Select
            value={
              categoryId
                ? categoriesData
                    ?.find((cat: Category) => cat.id.toString() === categoryId)
                    ?.name.toLowerCase() || "all"
                : "all"
            }
            onValueChange={(value) => {
              if (value === "all") {
                router.push(pathname);
              } else {
                const category = categoriesData?.find(
                  (cat: Category) => cat.name.toLowerCase() === value,
                );
                if (category) {
                  router.push(
                    pathname +
                      "?" +
                      createQueryString("categoryId", category.id.toString()),
                  );
                }
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesData?.map((category: Category) => (
                <SelectItem
                  key={category.id}
                  value={category.name.toLowerCase()}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <Suspense>
      <MyTopicsContent />
    </Suspense>
  );
}
