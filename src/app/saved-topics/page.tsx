"use client";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
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

import { Badge } from "~/components/ui/badge";
import { CategoryOrder } from "~/constants";
import { useQueryString } from "~/utils";
import { PostCategory } from "~/types/post";
import {
  loadBookmarksByUser,
  loadCategories,
  QueryKeys,
} from "~/core/api/queries";
import { useMe } from "~/Contexts/meContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Category } from "~/types/category";
import { bookmarkPost } from "~/core/api/mutations";
import { toast } from "sonner";
import { LexicalRenderer } from "~/components/lexical-renderer";

function SavedTopicsContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { me } = useMe();

  const { createQueryString } = useQueryString();

  const [topics, setTopics] = useState<PostCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const categoryId = searchParams.get("categoryId");

  const { data, error, isLoading, refetch } = useQuery<PostCategory[]>({
    queryKey: [QueryKeys.LoadBookmarksByUser, me?.id],
    queryFn: () => loadBookmarksByUser(me?.id),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
      refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove bookmark",
      );
    },
  });

  const [categoryOrder, setCategoryOrder] = useState<CategoryOrder | null>(
    null,
  );

  const handleOrderChange = (order: CategoryOrder) => {
    setCategoryOrder(order);

    if (!topics || topics.length <= 1) return;

    switch (order) {
      case CategoryOrder.MostRecent:
        setTopics((prev) =>
          [...prev].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
  };

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      console.error("Error loading bookmarks:", error);
      return;
    }
    if (!data || data.length === 0) {
      setTopics([]);
      return;
    }

    // Filter topics by category if categoryId is present
    let filteredTopics = data;
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
  }, [data, error, isLoading, categoryId, searchTerm]);

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
      <h4 className="font-medium text-2xl mb-2">Saved Topics</h4>
      <span className="font-normal text-tertiary">
        Save the topics you are most interested in and access them anytime you
        want.
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
                      <CardContent className="line-clamp-3 text-sm">
                        <LexicalRenderer content={topic.content} />
                      </CardContent>
                    </div>
                    <div className="pr-6">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          bookmarkMutate({
                            postId: topic.id,
                            userId: me?.id,
                            include: false,
                          });
                        }}
                      >
                        <BookmarkCheck className="text-orange-500" />
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
                        <p className="font-medium">
                          {topic.author.firstName} {topic.author.lastName}
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
      <SavedTopicsContent />
    </Suspense>
  );
}
