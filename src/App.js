import React, { useEffect, useState } from "react";
import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

function App() {
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);
  const [boardId, setBoardId] = useState(null);

  useEffect(() => {
    monday.listen("context", async (res) => {
      const boardId = res.data.boardIds[0];
      setBoardId(boardId);
      const itemsRes = await monday.api(`
        query {
          boards(ids: ${boardId}) {
            id
            name
            columns {
              id
              title
              type
            }
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
      `);
      
        const board = res.data.boards[0];
        setColumns(board.columns);
        setItems(board.items);
        console.log("Fetched columns:", board.columns);
        console.log("Fetched items:", board.items);
        
        board.items.forEach(item => {
          console.log(`Item: ${item.name}`);
          item.column_values.forEach(colVal => {
            console.log(`- ${colVal.id}: ${colVal.text}`);
          });
        });
      });
    }, []);


  return (
    <div style={{ padding: "1rem" }}>
      <h2>📊 Dashboard Widget Viewer</h2>
      {!boardId ? (
        <p>Please select a board in the widget settings.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Item Name</th>
              {columns.map((col) => (
                <th key={col.id}>{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                {columns.map((col) => {
                  const val = item.column_values.find((v) => v.id === col.id);
                  return <td key={col.id}>{val?.text || ""}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
