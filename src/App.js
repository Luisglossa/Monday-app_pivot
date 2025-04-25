import React, { useEffect, useState } from "react";
import Select from 'react-select';
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

function App() {
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);
  //const [boardId, setBoardId] = useState(null);
  const [columnVisibility, setColumnVisibility] = useState(columns.map(() => true)); // By default, all columns are visible
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Listen for the board context
    monday.listen("context", async (res) => {
      //const boardId = res.data.boardIds[0]; // Assuming you get an array of boardIds, use the first one
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
          setItems(board.items_page.items); // Set the items

          const initialVisibility = {};
          board.columns.forEach(col => {
            initialVisibility[col.id] = true; // Start all columns as visible
          });
          setColumnVisibility(initialVisibility);
        });      
    });
  }, []);

  const toggleColumnVisibility = (colId) => {
    setColumnVisibility(prevState => ({
      ...prevState,
      [colId]: !prevState[colId],
    }));
  };

  const columnOptions = columns.map(col => ({
    value: col.id,
    label: col.title
  }));
  const handleColumnChange = (selectedOptions) => {
    setSelectedColumns(selectedOptions);
  
    const newVisibility = {};
    columns.forEach(col => {
      newVisibility[col.id] = selectedOptions.some(option => option.value === col.id);
    });
    setColumnVisibility(newVisibility);
  };
  useEffect(() => {
    setSelectedColumns(columnOptions);
    const visibility = {};
    columnOptions.forEach(opt => {
      visibility[opt.value] = true;
    });
    setColumnVisibility(visibility);
  }, [columns]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '40px',
      borderColor: '#888',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#444',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#666',
    }),
    multiValue: () => ({
      display: 'none', // hides the selected items from showing
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 10,
    }),
  };


  return (
    
    
    <div style={{ padding: "1rem" }}>
      <h2><span>📊</span> Dashboard Widget Viewer</h2>
      <button
    onClick={() => setShowPanel(!showPanel)}
    style={{
      background: "#0073ea",
      color: "white",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    {showPanel ? "Hide Column Selector" : "Show Column Selector"}
  </button>

  {showPanel && (
    <div
      style={{
        marginTop: "0.5rem",
        border: "1px solid #ccc",
        padding: "1rem",
        borderRadius: "8px",
        background: "#f9f9f9",
      }}
    >
      <label style={{ display: "block", marginBottom: "0.5rem" }}>
        Select Visible Columns:
      </label>
      <Select
        isMulti
        options={columnOptions}
        value={selectedColumns}
        onChange={handleColumnChange}
        styles={customStyles}
        placeholder="Choose columns..."
        closeMenuOnSelect={false}
      />
    </div>
  )}

        <table border="1" cellPadding="5">
          <thead>
            <tr>
              
              {columns.length > 0 &&
        columns.map((col) => {
          if (columnVisibility[col.id]) {
            return <th key={col.id}>{col.title}</th>;
          }
          return null;
        })}
            </tr>
          </thead>
          <tbody>
            
          {items.map((item, rowIndex) => (
      <tr key={rowIndex}>
        <td>{item.name}</td>
        {item.column_values.map((col) => {
          if (columnVisibility[col.id]) {
            return <td key={col.id}>{col.text}</td>;
          }
          return null;
        })}
      </tr>
    ))}
          </tbody>
        </table>
      
    </div>
  );
}

export default App;
  