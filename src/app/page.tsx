import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader } from "~/components/ui/card";

const categories = [
  {
    id: "1",
    name: "Scoliosis",
    description: null,
    pictureUrl: "/placeholder-image.png",
  },
  {
    id: "2",
    name: "Osteoporosis / Osteopenia",
    description: null,
    pictureUrl: "/placeholder-image.png",
  },
  {
    id: "3",
    name: "Pain Relief",
    description: null,
    pictureUrl: "/placeholder-image.png",
  },
  {
    id: "4",
    name: "Stenosis",
    description: null,
    pictureUrl: "/placeholder-image.png",
  },
  {
    id: "5",
    name: "Posture & Kyphosis",
    description: null,
    pictureUrl: "/placeholder-image.png",
  },
  {
    id: "6",
    name: "Aging",
    description: null,
    pictureUrl: "/placeholder-image.png",
  },
  {
    id: "7",
    name: "Surgery",
    description: null,
    pictureUrl: "/placeholder-image.png",
  },
  {
    id: "8",
    name: "Other Back Questions",
    description: null,
    pictureUrl: "/placeholder-image.png",
  },
];

export default function Page() {
  return (
    <section className="pt-8 px-8">
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
                .replace("/", "-")
                .replace(/\s+/g, "-")}?title=${encodeURIComponent(
                category.name
              )}&categoryId=${category.id}`}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex items-center">
                  <Image
                    width={96}
                    height={96}
                    src={category.pictureUrl}
                    alt={category.name}
                    className="w-24 h-24 rounded-full mb-2"
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
