import React, { useEffect, useState } from "react";
import Select from 'react-select';
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

function App() {
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [boardId, setBoardId] = useState(null);
  const [visibleDivs, setVisibleDivs] = useState({pg1: true, pg2: false});

  useEffect(() => {
    // Listen for the board context
    monday.listen("context", async (res) => {
      const boardId = res.data.boardIds[0];
      setBoardId(boardId);
      // /(ids: 1702544988)
      // Fetch data using fetch API
      let query = `{
          boards(ids: ${boardId}) {
            name
            id
            columns {
              id
              title
              type
            }  
            items_page (limit: 500){
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

          monday.get("settings").then((res) => {
            const storedColumns = res.data.columnsPerBoard?.[boardId] || [];
          
            if (storedColumns && storedColumns.length > 0) {
            const selected = board.columns.filter(col => storedColumns.includes(col.id));
            setSelectedColumns(selected);
          
            const newVisibility = {};
            board.columns.forEach(col => {
              newVisibility[col.id] = storedColumns.includes(col.id);
            });
            setColumnVisibility(newVisibility);
          } else {
            const columnOptions = board.columns.map(col => ({
              value: col.id,
              label: col.title,
              isDisabled: col.title === "Name",
            }));
            setSelectedColumns(columnOptions); // Select all columns initially
          }
          });          
        });      
    });
  }, []);

  const columnOptions = columns.map(col => ({
    value: col.id,
    label: col.title,
    isDisabled: col.title === "Name",
  }));

  const handleColumnChange = (selectedOptions) => {   
    const sortedSelected = columnOptions.filter(opt =>
      selectedOptions.some(sel => sel.value === opt.value)
    );
    setSelectedColumns(sortedSelected);

    const newVisibility = {};
    columns.forEach(col => {
      newVisibility[col.id] = selectedOptions.some(opt => opt.value === col.id);
    });
    setColumnVisibility(newVisibility);

  // Save to settings
  const selectedIds = selectedOptions.map(opt => opt.value);

  monday.get("settings").then((res) => {
    const settings = res.data;
    const updatedColumnsPerBoard = {
      ...(settings.columnsPerBoard || {}),
      [boardId]: selectedIds
    };

    monday.set("settings", {
      columnsPerBoard: updatedColumnsPerBoard
    });
  });
  };

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
      backgroundColor: "#f0f0f0",
      display: "flex",
      margin: "3px 5px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 10,
    }),
    multiValueRemove: (provided,state) => ({
      ...provided,
      display: state.data.label === "Name" ? "none" : "unset"
    }),
  };

  const toggleDiv = (Divid) => {
    setVisibleDivs(prev => {
      const updated = { ...prev };
      Divid.forEach(id => {
        updated[id] = !prev[id];
    });
    return updated;
    });
  };


  return (
    
    
    <div style={{ padding: "1rem" }}>
      <h2></h2>
      <button 
      style={{
        background: "#0073ea",
        color: "white",
        border: "none",
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        cursor: "pointer",
        margin: "10px 0px",
      }}
      onClick={() => toggleDiv(['pg1','pg2']) }>{visibleDivs.pg1 ? "Show report" : "Show Board Data"}</button>
      {visibleDivs.pg1 && (<div id="pg1">
      <button
    onClick={() => setShowPanel(!showPanel)}
    style={{
      background: "#f1f1f1",
      color: "black",
      border: "none",
      padding: "0.5rem 0.6rem",
      borderRadius: "6px",
      cursor: "pointer",
      margin: "15px 0px",
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
        defaultValue={columnOptions[0]}
        value={selectedColumns}
        onChange={handleColumnChange}
        isClearable={false}
        styles={customStyles}
        placeholder="Choose columns..."
        closeMenuOnSelect={false}
      />
    </div>
  )}

        <table  className="custom-table" border="1" cellPadding="5">
          <thead >
            <tr>
              
              {columns.length > 0 &&
        columns.map((col) => {
          if (columnVisibility[col.id]) {
            return <th key={col.id} style={{width: "33%", height:"33%"}}>{col.title}</th>;
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
                <td key={col.id} style={{width: "33%", height:"33%"}}>{col.display_value ? col.display_value : ''}</td>
              );
            }
            if (col.type === 'board_relation') {
              return (
                <td key={col.id} style={{width: "33%", height:"33%"}}>{col.display_value ? col.display_value : ''}</td>
              );
            }
            
            return <td key={col.id} style={{width: "33%", height:"33%"}}>{col.text}</td>;
            }
          return null;
        })}
      </tr>
    ))}
          </tbody>
        </table>
        </div>
      )}
      {visibleDivs.pg2 && (<div id="pg2">
        <h2>EXAPLE FOR ADDING REPORT</h2>
       </div>
      )}
        
    </div>
  );
}

export default App;