import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader } from "~/components/ui/card";

import categories from "~/mocks/categories.json";

export default function Page() {
  return (
    <section className="p-8">
      <div>
        <h4 className="text-2xl font-medium mb-2">
          Hi Raphael. Welcome to our Community!
        </h4>
        <p className="mb-4">
          Choose a category and find support and information about back pain and
          spine health.
        </p>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-medium mb-2">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
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
                    src={category.pictureUrl}
                    alt={category.name}
                    className="w-[90px] h-[60px] rounded-full mb-2 group-hover:translate-y-[-5px] transition-transform"
                  />
                  <h3 className="text-lg font-medium ml-4">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 text-center mt-1">
                      {category.description}
                    </p>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
