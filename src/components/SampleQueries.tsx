import {SAMPLE_QUERIES} from "@/constants.ts";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {PlayIcon} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import {Dispatch, SetStateAction} from "react";

interface SampleQueriesListProps {
    executeQuery(query: string): void;
    setIsSampleQuerySheetOpen: Dispatch<SetStateAction<boolean>>;
}

const SampleQueriesList = ({executeQuery, setIsSampleQuerySheetOpen}: SampleQueriesListProps) => {
    return (
        <>
            {SAMPLE_QUERIES.map(({query, queryName}) => (
                <ScrollArea key={queryName}>
                    <Card className={"p-2"}>
                        <div
                            className={"flex w-full items-center font-semibold justify-between"}>
                            <div className={"text-sm"}>
                                {queryName}
                            </div>
                            <Button
                                aria-label={"Run sample query"}
                                variant={"outline"}
                                className={"p-2"}
                                onClick={() => {
                                    setIsSampleQuerySheetOpen(false);
                                    executeQuery(query)
                                }}
                            >
                                <PlayIcon className={"ml-1"} size={"1.25rem"}/>
                            </Button>
                        </div>
                        <Separator className={"my-2"}/>
                        <code className={"text-xs"}>{query}</code>
                    </Card>
                </ScrollArea>
            ))}
        </>
    )
}

export default SampleQueriesList;