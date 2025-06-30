import { LoaderCircle } from "lucide-react";

export const Loader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center justify-center flex flex-col items-center">
      <h1 className="text-xl font-semibold mb-4">Loading...</h1>
      <LoaderCircle className="animate-spin" width={32} height={32} />
    </div>
  </div>
);
