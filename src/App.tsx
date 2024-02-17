import './App.css'
import {useEffect} from "react";
import alasql from "alasql";
import {DATA_FILES} from "./constants.ts";

const App = () => {
    useEffect(() => {
        DATA_FILES.forEach(({fileName, tableName}) => {
            fetch(`data/${fileName}`)
                .then(response => response.text())
                .then(csvData => {
                    alasql(`CREATE TABLE ${tableName}`);
                    alasql(`INSERT INTO ${tableName} SELECT * FROM CSV(?, {headers: true, separator:","});`, [csvData])
                });
        });

        console.log(alasql.tables)
    }, []);

    return (
        <div>
            Hello world
            <button onClick={async () => {
                console.log(alasql(`SELECT * FROM categories`))
            }}>
                click
            </button>
        </div>
    )
}

export default App
