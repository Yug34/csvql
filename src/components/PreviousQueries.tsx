import {stripQueryOfComments} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {PlayIcon} from "lucide-react";
import {useQueryMetadataStore} from "@/store/queryMetadataStore.ts";
import {Dispatch, SetStateAction} from "react";

interface PreviousQueriesListProps {
    executeQuery(query: string): void;
    setIsPrevQuerySheetOpen: Dispatch<SetStateAction<boolean>>;
}

const PreviousQueriesList = ({executeQuery, setIsPrevQuerySheetOpen}: PreviousQueriesListProps) => {
    const {previousQueries} = useQueryMetadataStore();

    return (
        <>
            {previousQueries.length === 0 ? (
                <>Nothing to see here! Please run a query to see it in history.</>
            ) : (
                <>
                    {previousQueries.map(query => (
                        <div className={"flex justify-between items-center border rounded-md p-2"} key={query}>
                            <code className={"text-xs"}>{stripQueryOfComments(query)}</code>
                            <Button
                                aria-label={"Run previous query"}
                                variant={"outline"}
                                className={"p-2"}
                                onClick={() => {
                                    setIsPrevQuerySheetOpen(false);
                                    executeQuery(query)
                                }}
                            >
                                <PlayIcon className={"ml-1"} size={"1.25rem"}/>
                            </Button>
                        </div>
                    ))}
                </>
            )}
        </>
    )
}

export default PreviousQueriesList;