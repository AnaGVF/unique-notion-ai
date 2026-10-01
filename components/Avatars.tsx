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

    const all = [self, ...others];

    return (
        <div className='flex gap-2 items-center'>
            <p className='font-light text-sm'>
                Users currently editing this page
            </p>

            <div className='flex -space-x-3'>
                {all.map((other, i) => (
                    <TooltipProvider key={other?.id || i}>
                        <Tooltip>
                            <TooltipTrigger className='relative hover:z-50 focus:z-50 transition-transform duration-200 hover:scale-110'>
                                <Avatar>
                                    <AvatarImage src={other?.info.avatar} />
                                    <AvatarFallback>{other?.info.name}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{self?.id === other?.id ? "You" : other?.info.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>

        </div>
    )
}

export default Avatars