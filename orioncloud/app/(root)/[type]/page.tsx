import Sort from "@/components/sort"
import {getFiles} from "@/lib/actions/file.actions"
import Card, { type CardFile } from "@/components/Card"

type SearchParamProps = {
    params: Promise<{ type: string }>;
};

const Page = async ({ params }: SearchParamProps) => {
    const { type } = await params;

    const files = await getFiles();

    return <div className="page-container">
        <section className="w-full">
            <h1 className="text-3xl font-bold capitalize sm:text-4xl">
                {type} 
            </h1>
            <div className="mt-4 flex w-full items-center justify-between gap-4">
                <p className="body-1">
                    Total: <span className="h5">
                        0 MB
                    </span>
                </p>

                <div className="flex items-center gap-2">
                    <p className='body-1 hidden sm:block text-light-200'>Sort by:</p>

                    <Sort/>
                </div>
            </div>
        </section>

        {/* Currently working on */}
        {files.total > 0 ? (
            <section aria-label="Files" className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3 xl:grid-cols-4">
                {files.documents.map((file: CardFile) => (
                    <Card key={file.$id} file={file}/>
                ))}
            </section>
        ): <p className="empty-list">No files uploaded</p>}
    </div>
};

export default Page;
