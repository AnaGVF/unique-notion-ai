"use client"

import { useOthers, useSelf } from '@liveblocks/react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import React from 'react'

function Avatars() {
    const others = useOthers();
    const self = useSelf();

    const all = [self, ...others].filter(Boolean);

    return (
        <div className='flex items-center gap-3 bg-gray-100/80 dark:bg-gray-900/80 px-3 py-1.5 rounded-full border border-gray-200/80 dark:border-gray-800/80 backdrop-blur-xs'>
            {/* Live Indicator Dot */}
            <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className='text-xs font-medium text-gray-600 dark:text-gray-400 hidden sm:inline'>
                    {all.length} {all.length === 1 ? 'user online' : 'users online'}
                </span>
            </div>

            {/* Avatar Stack */}
            <div className='flex -space-x-2 overflow-hidden'>
                {all.map((other, i) => (
                    <TooltipProvider key={other?.id || i}>
                        <Tooltip>
                            <TooltipTrigger className='relative hover:z-50 focus:z-50 transition-all duration-200 hover:scale-110'>
                                <Avatar className="w-7 h-7 ring-2 ring-white dark:ring-gray-950 shadow-xs">
                                    <AvatarImage src={other?.info?.avatar} />
                                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                        {other?.info?.name?.slice(0, 2).toUpperCase() || "AN"}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs flex items-center gap-1.5 px-2.5 py-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <p className="font-medium">
                                    {self?.id === other?.id ? `You (${other?.info?.name || "Anonymous"})` : other?.info?.name || "Anonymous"}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </div>
    )
}

export default Avatars