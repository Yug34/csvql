export const DATA_FILES = [
    {
        fileName: "categories.csv",
        tableName: "categories"
    },
    {
        fileName: "customers.csv",
        tableName: "customers"
    },
    {
        fileName: "employee_territories.csv",
        tableName: "employee_territories"
    },
    {
        fileName: "employees.csv",
        tableName: "employees"
    },
    {
        fileName: "order_details.csv",
        tableName: "order_details"
    },
    {
        fileName: "orders.csv",
        tableName: "orders"
    },
    {
        fileName: "products.csv",
        tableName: "products"
    },
    {
        fileName: "regions.csv",
        tableName: "regions"
    },
    {
        fileName: "shippers.csv",
        tableName: "shippers"
    },
    {
        fileName: "suppliers.csv",
        tableName: "suppliers"
    },
    {
        fileName: "territories.csv",
        tableName: "territories"
    }
];

export const SAMPLE_QUERIES: {query: string; queryName: string;}[] = [
    {
        query: `SELECT t.territoryDescription FROM territories t JOIN employee_territories et ON t.territoryID = et.territoryID WHERE et.employeeID = 2;`,
        queryName: "Random"
    }
]