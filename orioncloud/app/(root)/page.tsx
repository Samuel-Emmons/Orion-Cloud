import Card, { type CardFile } from "@/components/Card";
import Sort from "@/components/sort";
import { getFiles } from "@/lib/actions/file.actions";

type DashboardProps = {
  searchParams: Promise<{ sort?: string | string[] }>;
};

export default async function Home({ searchParams }: DashboardProps) {
  const params = await searchParams;
  const sort =
    typeof params.sort === "string" ? params.sort : "$createdAt-desc";

  const [recentFiles, allFiles] = await Promise.all([
    getFiles({ sort: "$createdAt-desc", limit: 4 }),
    getFiles({ sort }),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to Orion Cloud</p>
      </header>

      <section aria-labelledby="recent-files-heading">
        <div className="mb-4">
          <h2 id="recent-files-heading" className="text-xl font-semibold">
            Recent Files
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Your latest uploads and recently uploaded files shared with you.
          </p>
        </div>

        {recentFiles.documents.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 xl:grid-cols-6">
            {recentFiles.documents.map((file: CardFile) => (
              <Card key={file.$id} file={file} className="p-2! gap-2!" />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-gray-300 bg-white p-6 text-gray-600">
            Upload your first file to get started.
          </p>
        )}
      </section>

      <section
        aria-labelledby="all-files-heading"
        className="border-t border-gray-300 pt-8"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="all-files-heading" className="text-xl font-semibold">
            All Files
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({allFiles.total})
            </span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Sort />
          </div>
        </div>

        {allFiles.documents.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 xl:grid-cols-6">
            {allFiles.documents.map((file: CardFile) => (
              <Card key={file.$id} file={file} className="p-2! gap-2!" />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No files available.</p>
        )}
      </section>
    </div>
  );
}
