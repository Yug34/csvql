import './App.css'
import {useEffect, useState} from "react";
import alasql from "alasql";
import {DATA_FILES} from "./constants.ts";
import {Button} from "@/components/ui/button.tsx";

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
                <>
                    <Button onClick={() => {
                        console.log(alasql(`SELECT * FROM categories`))
                    }}>
                        categories
                    </Button>
                    <Button onClick={() => {
                        console.log(alasql(`SELECT * FROM products WHERE `))
                    }}>
                        products
                    </Button>
                    <Button onClick={() => {
                        console.log(alasql(`SELECT t.territoryDescription
                                    FROM territories t
                                    JOIN employee_territories et ON t.territoryID = et.territoryID
                                    WHERE et.employeeID = 2;
                                    `))
                    }}>
                        join query
                    </Button>
                </>
            ) : (
                <div>Not yet Loaded</div>
            )}
        </div>
    )
}

export default App
