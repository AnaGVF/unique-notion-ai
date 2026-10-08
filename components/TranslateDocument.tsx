'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import * as Y from "yjs";
import { Button } from "./ui/button";
import { FormEvent, useState, useTransition } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BotIcon, LanguagesIcon } from "lucide-react";
import { toast } from "sonner";
import Markdown from "react-markdown";

type Language =
    | "english"
    | "spanish"
    | "french"
    | "german"
    | "chinese"
    | "japanese"
    | "korean"
    | "russian"
    | "italian"
    | "portuguese"
    | "dutch"
    | "swedish"
    | "norwegian"
    | "finnish"
    | "danish"
    | "polish"
    | "turkish"
    | "arabic"
    | "hebrew"
    | "hindi";

const languages: Language[] = [
    "english",
    "spanish",
    "french",
    "german",
    "chinese",
    "japanese",
    "korean",
    "russian",
    "italian",
    "portuguese",
    "dutch",
    "swedish",
    "norwegian",
    "finnish",
    "danish",
    "polish",
    "turkish",
    "arabic",
    "hebrew",
    "hindi",
];

function TranslateDocument({ doc }: { doc: Y.Doc }) {
    const [isOpen, setIsOpen] = useState(false);
    const [summary, setSummary] = useState('');
    const [language, setLanguage] = useState<string>("");
    const [isPending, startTransition] = useTransition();

    const handleAskQuestion = async (e: FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            const documentData = doc.get('document-store').toJSON();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/translateDocument`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        documentData,
                        targetLang: language,
                    })
                }
            );

            if (res.ok) {
                const { translatedText } = await res.json();
                setSummary(translatedText);
                toast.success("Successfully translated summary!");
            } else {
                toast.error("Failed to translate document");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button asChild variant="outline">
                <DialogTrigger>
                    <LanguagesIcon />
                    Translate
                </DialogTrigger>
            </Button>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Translate the Document</DialogTitle>
                    <DialogDescription>
                        Select a language and AI will translate a summary of the document in the selected language.
                    </DialogDescription>
                    <hr className="mt-5 border-gray-200 dark:border-gray-800" />
                </DialogHeader>

                {summary && (
                    <div className="flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                        <div className="flex">
                            <BotIcon className="w-10 flex-shrink-0" />
                            <p className="font-bold">
                                AI {isPending ? "is thinking..." : "says:"}
                            </p>
                        </div>
                        <div>{isPending ? "Thinking..." : <Markdown>{summary}</Markdown>}</div>
                    </div>
                )}

                <form className='flex gap-2' onSubmit={handleAskQuestion}>
                    <Select value={language} onValueChange={(value) => setLanguage(value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a language" />
                        </SelectTrigger>

                        <SelectContent>
                            {languages.map((language) => (
                                <SelectItem key={language} value={language}>
                                    {language.charAt(0).toUpperCase() + language.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button type='submit' disabled={!language || isPending}>
                        {isPending ? 'Translating...' : 'Translate'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default TranslateDocument