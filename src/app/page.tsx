"use client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Loader } from "~/components/loader";
import { Card, CardHeader } from "~/components/ui/card";
import { useMe } from "~/Contexts/meContext";
import { fetchUserData, loadCategories, QueryKeys } from "~/core/api/queries";

import { Category } from "~/types/category";
import { UserResponse } from "~/types/user";
import { getCategoryImagePathByCategoryName } from "~/utils";

const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

export default function Page() {
  const { setMe } = useMe();
  const {
    data: userData,
    error: userError,
    isLoading: userIsLoading,
  } = useQuery<UserResponse>({
    queryKey: [QueryKeys.UserData],
    queryFn: () => fetchUserData(MOCK_USER_ID), // Replace with actual externalId
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

  useEffect(() => {
    if (userData) {
      setMe(userData);
    }
    // Optionally, you can handle any side effects or state updates here
  }, [userData, setMe]);

  if (userIsLoading || categoriesIsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (userError || categoriesError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">
          Error loading application, please try again later.{" "}
        </p>
        <p className="text-sm text-muted-foreground">
          {(userError || categoriesError) instanceof Error
            ? (userError || categoriesError)!.message
            : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  return (
    <section className="p-8">
      <div>
        <h4 className="text-2xl font-medium mb-2">
          Hi {userData?.firstName}. Welcome to our Community!
        </h4>
        <p className="mb-4">
          Choose a category and find support and information about back pain and
          spine health.
        </p>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-medium mb-2">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoriesData?.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.name
                .toLowerCase()
                .replace("/", "")
                .replace(/\s+/g, "-")}?title=${encodeURIComponent(
                category.name
              )}&categoryId=${category.id}`}
            >
              <Card className="hover:shadow-lg transition-shadow group">
                <CardHeader className="flex items-center">
                  <Image
                    width={90}
                    height={60}
                    src={getCategoryImagePathByCategoryName(category.name)}
                    alt={category.name}
                    className="w-[90px] h-[60px] rounded-full mb-2 group-hover:translate-y-[-5px] transition-transform"
                  />
                  <div className="flex flex-col items-baseline">
                    <h3 className="text-lg font-medium ml-4">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
