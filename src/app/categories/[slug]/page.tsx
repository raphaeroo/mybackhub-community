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

import topicsMock from "~/mocks/topics.json";
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

type Topic = (typeof topicsMock)[0];

export default function Page() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [topics, setTopics] = useState<Topic[]>([]);

  const [categoryOrder, setCategoryOrder] = useState<CategoryOrder>(
    CategoryOrder.MostRecent
  );

  const handleOrderChange = (order: CategoryOrder) => {
    setCategoryOrder(order);

    if (!topics || topics.length <= 1) return;

    switch (order) {
      case CategoryOrder.MostRecent:
        setTopics((prev) =>
          [...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        );
        break;
      case CategoryOrder.MostLiked:
        setTopics((prev) =>
          [...prev].sort((a, b) => b.likes_count - a.likes_count)
        );
        break;
      case CategoryOrder.MostComments:
        setTopics((prev) =>
          [...prev].sort((a, b) => b.comments_count - a.comments_count)
        );
        break;
    }
  };

  useEffect(() => {
    const filteredTopics = topicsMock.filter((topic: Topic) => {
      return topic.category_id === Number(searchParams.get("categoryId"));
    });

    setTopics(filteredTopics);
  }, [searchParams]);

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
            {topics.map((topic: Topic) => (
              <Link
                key={topic.id}
                href={`/topic/${topic.id}?categoryName=${encodeURIComponent(
                  topic.category_name
                )}&categoryId=${topic.category_id}&from=${pathname}`}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardHeader className="w-full">
                        <CardTitle>{topic.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="line-clamp-2 text-sm">
                        {topic.content}
                      </CardContent>
                    </div>
                    <div className="pr-2">
                      <Button variant="outline">
                        <Bookmark />
                      </Button>
                    </div>
                  </div>
                  <CardFooter className="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center pt-2">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <div className="flex items-center gap-2 mb-2 md:mb-0">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="font-medium">
                            {topic.author.display_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium">
                          {topic.author.display_name}
                        </p>
                      </div>
                      <div className="flex items-center md:items-center gap-2 text-xs text-gray-500">
                        <DotIcon className="text-gray-300 hidden md:block" />
                        <p className="text-xs text-gray-500">
                          {dayjs(topic.created_at).format("MM/DD/YYYY")}
                        </p>
                        <DotIcon className="text-gray-300" />
                        <Badge variant="outline">
                          <ClipboardListIcon /> {topic.category_name}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 font-medium mt-4 md:mt-0">
                      <div className="flex items-center">
                        <ThumbsUpIcon className="h-4 w-4" />
                        <span className="ml-1 text-xs">
                          {topic.likes_count} likes
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4" />
                        <span className="ml-1 text-xs">
                          {topic.comments_count} comments
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
            onSubmit={(data) => console.log(data)}
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
