import { TabsContent } from "@radix-ui/react-tabs";
import {
  Bookmark,
  FolderOpen,
  MessageSquare,
  DotIcon,
  ThumbsUpIcon,
  MessageCircle,
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
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

import topicsMock from "~/app/mocks/topics.json";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";

type CategoryParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<CategoryParams>;
}) {
  const { slug } = await params;
  return {
    title: `MyBackHub Community | Category: ${slug}`,
    description: `Explore topics related to ${slug}.`,
  };
}

type CategorySearchParams = {
  title?: string;
  description?: string;
  categoryId: string;
};

type Topic = (typeof topicsMock)[0];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<CategorySearchParams>;
}) {
  const params = await searchParams;
  const filteredTopics = topicsMock.filter((topic: Topic) => {
    return topic.category_id === Number(params.categoryId);
  });

  return (
    <section className="pt-8 px-8">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Categories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-tertiary font-medium">
                {params?.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-4">
        <h4 className="font-normal text-2xl mb-2">
          Topics about{" "}
          <span className="font-medium text-tertiary">{params?.title}</span>
        </h4>
      </div>
      <div className="flex flex-col md:flex-row mt-8">
        <div className="flex-7 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pr-4">
          <Tabs
            defaultValue="all"
            className="w-full bg-transparent pb-0 gap-0"
          >
            <div className="overflow-x-scroll md:overflow-x-visible scrollbar-hide">
              <TabsList className="bg-transparent pb-0 flex w-max md:w-full whitespace-nowrap scrollbar-hide">
              <TabsTrigger
                value="all"
                className="min-w-[160px] bg-transparent rounded-none border-transparent shadow-none data-[state=active]:bg-transparent  data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary"
              >
                <MessageSquare className="h-4 w-4" />
                All topics
              </TabsTrigger>

              <TabsTrigger
                value="saved"
                className="min-w-[160px] bg-transparent rounded-none border-transparent shadow-none data-[state=active]:bg-transparent  data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary"
              >
                <Bookmark className="h-4 w-4" />
                Saved topics
              </TabsTrigger>

              <TabsTrigger
                value="my"
                className="min-w-[160px] bg-transparent rounded-none border-transparent shadow-none data-[state=active]:bg-transparent  data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary"
              >
                <FolderOpen className="h-4 w-4" />
                My topics
              </TabsTrigger>
              </TabsList>
            </div>
            <div className="border-b border-gray-200 w-full mb-6" />
            <TabsContent value="all">
              <div className="gap-4 flex flex-col min-h-[400px]">
                {filteredTopics.map((topic: Topic) => (
                  <Card
                    key={topic.id}
                    className="hover:shadow-lg transition-shadow"
                  >
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
                ))}
              </div>
            </TabsContent>
            <TabsContent value="saved">Saved Topics</TabsContent>
            <TabsContent value="my">My Topics</TabsContent>
          </Tabs>
        </div>
        <div className="flex-2 pt-4 md:pl-4">
          <p>right side soon</p>
        </div>
      </div>
    </section>
  );
}
