import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-github.js";
import "ace-builds/src-noconflict/theme-twilight.js";
import {useAlasqlStore} from "@/store/alasqlStore.ts";
import {useTheme} from "@/components/ui/theme-provider.tsx";

export const SQLEditor = () => {
    const {query, setQuery} = useAlasqlStore();
    const { theme } = useTheme();

    return (
        <AceEditor
            style={{width: "100%", height: "100%"}}
            fontSize={"18px"}
            className="editorInput"
            placeholder="Enter SQL Query here"
            mode="sql"
            theme={theme === "dark" ? "twilight" : "github"}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            onChange={(value: string) => {
                setQuery(value)
            }}
            value={query ?? ""}
            setOptions={{
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