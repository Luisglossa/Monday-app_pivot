import React, { useEffect, useState } from "react";
import monday from "./mondayClient";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    monday.listen("context", async (res) => {
      const boardId = res.data.boardId;

      if (boardId) {
        const result = await monday.api(`
          query {
            boards(ids: ${boardId}) {
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
        setData(result.data.boards[0].items);
      }
    });
  }, []);

  return (
    <div>
      <h1>Pivot Table Viewer</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default App;
