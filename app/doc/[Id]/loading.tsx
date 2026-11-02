export default function Loading() {
    return (
        <div className='flex-1 h-full bg-white dark:bg-gray-950 p-6 sm:p-8 md:p-10 rounded-xl shadow-xs border border-gray-200/80 dark:border-gray-800/80 animate-pulse'>
            <div className='flex max-w-6xl mx-auto items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800/60'>
                <div className="h-4 w-28 rounded-md bg-neutral-200/80 dark:bg-neutral-800" />
                <div className="flex items-center gap-2">
                    <div className="h-7 w-20 rounded-md bg-neutral-200/80 dark:bg-neutral-800" />
                    <div className="h-7 w-20 rounded-md bg-neutral-200/80 dark:bg-neutral-800" />
                </div>
            </div>
            <div className='max-w-6xl mx-auto pt-8 space-y-4'>
                <div className="h-10 w-2/5 rounded-lg bg-neutral-200/80 dark:bg-neutral-800" />
                <div className="pt-6 space-y-2.5">
                    <div className="h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-900" />
                    <div className="h-4 w-5/6 rounded bg-neutral-100 dark:bg-neutral-900" />
                    <div className="h-4 w-1/2 rounded bg-neutral-100 dark:bg-neutral-900" />
                </div>
            </div>
        </div>
    );
}

