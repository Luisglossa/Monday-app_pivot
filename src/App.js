import React, { useEffect, useState } from "react";
import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

function App() {
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);
  const [boardId, setBoardId] = useState(null);

  useEffect(() => {
    monday.listen("context", async (res) => {
      const ids = res.data.boardIds;
      if (ids && ids.length > 0) {
        setBoardId(ids[0]); // Use first board selected
      }
    });
  }, []);

  useEffect(() => {
    if (!boardId) return;

    // Fetch board data when boardId is ready
    monday.api(`
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
    `).then((res) => {
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
  }, [boardId]);

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
