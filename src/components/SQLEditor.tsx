import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-github.js";
import {useAlasqlStore} from "@/store/alasqlStore.ts";

export const SQLEditor = () => {
    const {query, setQuery} = useAlasqlStore();

    return (
        <AceEditor
            fontSize={"18px"}
            className="editorInput"
            placeholder="Enter SQL Query here"
            mode="sql"
            theme="github"
            name="blah2"
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            onChange={(value: string) => {
                setQuery(value)
            }}
            value={query ?? ""}
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                showLineNumbers: true,
                wrap: true,
                hScrollBarAlwaysVisible: false,
                vScrollBarAlwaysVisible: false,
                tabSize: 2,
                cursorStyle: "smooth",
            }}
        />
    )
}