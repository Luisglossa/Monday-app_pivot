import React, { useEffect, useState } from "react";
import Select from 'react-select';
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

function App() {
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);
  //const [boardId, setBoardId] = useState(null);
  const [columnVisibility, setColumnVisibility] = useState({});
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
                  type
                  value
                  ... on MirrorValue {
                    display_value
                    id
                  }
                  ... on BoardRelationValue {
                    display_value
                    id
                  }
                }
              }
            }
          }
        }`;
      fetch ('/api/fetchMonday', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            
            //'API-Version': '2023-10', // Specify the API version
          },
          body: JSON.stringify({ 'query' : query }),
        })
        .then(res => res.json())
        .then(data => {
          console.log(JSON.stringify(data, null, 2));
          const board = data.data.boards[0];
          setColumns(board.columns); // Set the columns
          setItems(board.items_page.items); // Set the items

          // Set initial column visibility to true for all columns
          const initialVisibility = {};
          board.columns.forEach(col => {
            initialVisibility[col.id] = true; // Start all columns as visible
          });
          setColumnVisibility(initialVisibility);

          // Initialize selected columns for the dropdown
          const columnOptions = board.columns.map(col => ({
            value: col.id,
            label: col.title
          }));
          setSelectedColumns(columnOptions); // Select all columns initially
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
    
    // Update column visibility based on selected options
    const newVisibility = {};
    columns.forEach(col => {
      newVisibility[col.id] = selectedOptions.some(option => option.value === col.id);
    });
    setColumnVisibility(newVisibility);
  };

  //useEffect(() => {
    //setSelectedColumns(columnOptions);
    //const visibility = {};
    //columnOptions.forEach(opt => {
      //visibility[opt.value] = true;
    //});
    //setColumnVisibility(visibility);
  //}, [columns]);

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
      <h2> Dashboard Widget Viewer</h2>
      <button
    onClick={() => setShowPanel(!showPanel)}
    style={{
      background: "#0073ea",
      color: "white",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "6px",
      cursor: "pointer",
      margin: "10px 0px",
    }}
  >
    {showPanel ? "Hide Column Selector" : "Show Column Selector"}
  </button>

  {showPanel && (
    <div
      style={{
        marginTop: "10px 0px",
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

        <table  className="custom-table" border="1" cellPadding="0" style={{borderCollapse: 'collapse'}}>
          <thead >
            <tr>
              
              {columns.length > 0 &&
        columns.map((col) => {
          if (columnVisibility[col.id]) {
            return <th key={col.id} style={{width: '8rem', height:'7rem'}}>{col.title}</th>;
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
            if (col.type === 'mirror') {
              return (
                <td key={col.id}>{col.display_value ? col.display_value : ''}</td>
              );
            }
            if (col.type === 'board_relation') {
              return (
                <td key={col.id}>{col.display_value ? col.display_value : ''}</td>
              );
            }
            
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