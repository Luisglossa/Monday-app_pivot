import React, { useEffect, useState } from "react";
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

function App() {
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);
  //const [boardId, setBoardId] = useState(null);

  useEffect(() => {
    // Listen for the board context
    monday.listen("context", async (res) => {
      const boardId = res.data.boardIds[0]; // Assuming you get an array of boardIds, use the first one
      //setBoardId(boardId); // Store the boardId in the state

      // Fetch data using fetch API
      let query = `{
          boards(ids: 1702544988) {
            name
            id
            columns {
              id
              title
              type
            }  
            items_page {
              cursor  
              items {
                id
                name
                column_values {
                  id
                  text
                }
              }
            }
          }
        }`;
      fetch ("https://api.monday.com/v2", {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ5NzcxNzIyNSwiYWFpIjoxMSwidWlkIjo3MTkwNjEwMCwiaWFkIjoiMjAyNS0wNC0wOVQxMzo0Nzo0Mi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjQ5NjgwNTcsInJnbiI6ImV1YzEifQ.lqrSr9M9YPx0lKPOYYhOsF41o-KMcd1PQHa5lCDv6Zk', // Replace with your Monday.com API key
            'API-Version': '2023-10', // Specify the API version
          },
          body: JSON.stringify({ 'query' : query }),
        })
        .then(res => res.json())
        .then(data => {
          console.log(JSON.stringify(data, null, 2));
          const board = data.data.boards[0];
          setColumns(board.columns); // Set the columns
          setItems(board.items); // Set the items
          console.log("Fetched columns:", board.columns);
          console.log("Fetched items:", board.items);
        });

        // Debugging: Output column and item values
       // board.items.forEach((item) => {
          //console.log(`Item: ${item.name}`);
          //item.column_values.forEach((colVal) => {
           // console.log(`- ${colVal.id}: ${colVal.text}`);
          //});
       // });
      
    });
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📊 Dashboard Widget Viewer</h2>
      
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Item Name</th>
              {columns.length > 0 &&
        columns.map((col, idx) => (
          <th key={idx}>{col.title}</th>
        ))}
            </tr>
          </thead>
          <tbody>
          {items.map((item, rowIndex) => (
      <tr key={rowIndex}>
        {item.column_values.map((col, colIndex) => (
          <td key={colIndex}>{col.text}</td>
        ))}
      </tr>
    ))}
          </tbody>
        </table>
      
    </div>
  );
}

export default App;
  