"use client";
import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bookmark,
  DotIcon,
  ThumbsUpIcon,
  MessageCircle,
  SearchIcon,
  CheckIcon,
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

import topicsMock from "~/mocks/topics.json";
import categories from "~/mocks/categories.json";

type Topic = (typeof topicsMock)[0];
type Category = (typeof categories)[0];

enum CategoryOrder {
  LastActivities = "last_activities",
  MostRecent = "most_recent",
  MostComments = "most_comments",
}

export default function Page() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const filteredTopics = useMemo(
    () =>
      topicsMock.filter((topic: Topic) => {
        if (searchParams.get("categoryId")) {
          return topic.category_id === Number(searchParams.get("categoryId"));
        }
        return true; // If no categoryId is provided, return all topics
      }),
    [searchParams]
  );

  const createQueryString = useCallback((name: string, value: string) => {
    const params = new URLSearchParams();
    params.set(name, value);

    return params.toString();
  }, []);

  const [categoryOrder, setCategoryOrder] = useState<CategoryOrder>(
    CategoryOrder.MostRecent
  );

  const handleOrderChange = (order: CategoryOrder) => {
    setCategoryOrder(order);
  };

  return (
    <Suspense>
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
                />
              </div>
              <p>Listing {filteredTopics.length} topics</p>
            </div>

            <div className="gap-4 flex flex-col min-h-[400px]">
              {filteredTopics.map((topic: Topic) => (
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
                          <p className="text-xs text-gray-500">
                            Last Activity at{" "}
                            {dayjs().diff(
                              dayjs(topic.last_activity_at),
                              "days"
                            ) > 0
                              ? dayjs(topic.last_activity_at).format(
                                  "MM/DD/YYYY"
                                )
                              : `${dayjs(topic.last_activity_at).format(
                                  "HH:mm"
                                )} ago`}
                          </p>
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
          <div className="flex-2 md:pl-4">
            <div className="flex flex-col gap-4 text-left">
              <p className="text-sm font-medium">Order By</p>
              <Button
                className="justify-between"
                variant={
                  categoryOrder === CategoryOrder.LastActivities
                    ? "default"
                    : "outline"
                }
                onClick={() => handleOrderChange(CategoryOrder.LastActivities)}
              >
                Last activities
                {categoryOrder === CategoryOrder.LastActivities && (
                  <CheckIcon />
                )}
              </Button>
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
              onValueChange={(value) => {
                const category = categories.find(
                  (cat: Category) => cat.name.toLowerCase() === value
                );
                if (category) {
                  router.push(
                    pathname +
                      "?" +
                      createQueryString("categoryId", category.id.toString())
                  );
                } else {
                  router.push(pathname);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: Category) => (
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
    </Suspense>
  );
}
