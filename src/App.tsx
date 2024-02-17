import './App.css'
import {useEffect, useState} from "react";
import alasql from "alasql";
import {DATA_FILES} from "./constants.ts";

const App = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        Promise.all(DATA_FILES.map(({fileName, tableName}) => {
            fetch(`data/${fileName}`)
                .then(response => response.text())
                .then(csvData => {
                    alasql(`CREATE TABLE ${tableName}`);
                    alasql(`INSERT INTO ${tableName} SELECT * FROM CSV(?, {headers: true, separator:","});`, [csvData])
                });
        })).then(() => {
            setIsLoaded(true)
        });
    }, []);

    return (
        <div>
            {isLoaded ? (
                <div>Loaded</div>
            ) : (
                <div>Not yet Loaded</div>
            )}
            <button onClick={() => {
                console.log(alasql(`SELECT * FROM categories`))
            }}>
                categories
            </button>
            <button onClick={() => {
                console.log(alasql(`SELECT * FROM products WHERE `))
            }}>
                products
            </button>
            <button onClick={() => {
                console.log(alasql(`SELECT t.territoryDescription
                                    FROM territories t
                                    JOIN employee_territories et ON t.territoryID = et.territoryID
                                    WHERE et.employeeID = 2;
                                    `))
            }}>
                join query
            </button>
        </div>
    )
}

export default App
