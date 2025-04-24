import React, { useEffect, useState } from "react";
import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

function App() {
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    monday.listen("context", async (res) => {
      const boardId = res.data.boardId;

      const itemsRes = await monday.api(`
        query {
          boards(ids: ${boardId}) {
            columns {
              id
              title
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

      const board = itemsRes.data.boards[0];
      setColumns(board.columns);
      setItems(board.items);
    });
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📋 Monday Board Viewer</h2>
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
    </div>
  );
}

export default App;
