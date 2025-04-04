import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTable,
  FaSpinner,
} from "react-icons/fa";
import { motion } from "framer-motion";
import "./ComponentsStyles/DatabaseTables.css";
import useFetch from "./Hooks/useAllTable.jsx";

const DatabaseTables = () => {
  const [activeTable, setActiveTable] = useState("Users");
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const apiEndpoints = {
    Users: "https://localhost:7196/api/Admin/User",
    Workouts: "https://localhost:7196/api/Admin/Workout",
    Diets: "https://localhost:7196/api/Admin/Diet",
    Ranks: "https://localhost:7196/api/Admin/Ranks",
    MuscleGroups: "https://localhost:7196/api/Admin/MuscleGroups",
    UserActivity: "https://localhost:7196/api/Admin/UserActivity",
  };

  const {
    data: fetchedData,
    loading,
    error,
  } = useFetch(apiEndpoints[activeTable]);

  const getProfilePicture = (item) => {
    if (!item) return "No profile picture"; // Ha üres, azonnal visszatérünk
    const mimeType = item.startsWith("/9j/") ? "jpeg" : "png"; // Base64 ellenőrzés
    return `data:image/${mimeType};base64,${item}`;
  };
  

  useEffect(() => {
    if (fetchedData) {
      const transformedData = fetchedData.map((item) => {
        // Handle UserActivity special case
        if (activeTable === "UserActivity") {
          return {
            id: item.id,
            userId: item.userId,
            dietId: item.dietId,
            workoutId: item.workoutId,
            muscleGroupId: item.muscleGroupId,
            ranksId: item.ranksID,
          };
        }
        // Handle Users special case
        if (activeTable === "Users") {
          return {
            id: item.Id || item.id, // Handle both Id and id
            username: item.Username || item.username,
            email: item.Email || item.email,
            name: item.Name || item.name,
            birthDate: item.BirthDate || item.birthDate,
            profilePicture: item.profilePicture ? getProfilePicture(item.profilePicture) : "No profile picture",
            password : item.password,
            gender: item.men == 0 ? "Male" : "Female",
          };
        }
        return item;
      });
      setData(transformedData);
      setCurrentPage(1);
      setSortConfig({ key: null, direction: "ascending" });
    }
  }, [fetchedData, activeTable]);

  const tables = [
    { id: 1, name: "Users", displayName: "Users Table" },
    { id: 2, name: "Workouts", displayName: "Workouts Table" },
    { id: 3, name: "Diets", displayName: "Diets Table" },
    { id: 4, name: "Ranks", displayName: "Ranks Table" },
    { id: 5, name: "MuscleGroups", displayName: "Muscle Groups Table" },
    { id: 6, name: "UserActivity", displayName: "User Activity Table" },
  ];

  const tableRef = useRef(null);
  const theadRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (tableRef.current && theadRef.current) {
        const tableRect = tableRef.current.getBoundingClientRect();
        const theadRect = theadRef.current.getBoundingClientRect();
        const isOverlapping = tableRect.top < theadRect.bottom;

        const actionButtons =
          tableRef.current.querySelectorAll(".database-actions");
        actionButtons.forEach((button) => {
          button.style.background = isOverlapping ? "white" : "transparent";
          button.style.zIndex = isOverlapping ? "1" : "0";
          button.style.boxShadow = isOverlapping
            ? "0 2px 4px rgba(0,0,0,0.1)"
            : "none";
        });
      }
    };

    const tableElement = tableRef.current;
    tableElement?.addEventListener("scroll", handleScroll);

    return () => {
      tableElement?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleTableChange = (tableName) => {
    setActiveTable(tableName);
    setEditingId(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  };

  const getFilteredData = () => {
    const sortedData = getSortedData();
    if (!searchTerm) return sortedData;

    return sortedData.filter((row) =>
      Object.values(row).some((val) =>
        val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setEditForm(data.find((item) => item.id === id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = () => {
    setData(
      data.map((item) =>
        item.id === editingId ? { ...item, ...editForm } : item
      )
    );
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTableHeaders = () => {
    if (data.length === 0) return [];
    const headers = Object.keys(data[0]);

    // UserActivity táblánál minden mezőt megjelenítünk
    if (activeTable === "UserActivity") {
      return headers;
    }

    // Egyéb tábláknál csak a nem kívánt mezőket szűrjük ki
    return headers.filter(
      (header) => !["internal_field1", "internal_field2"].includes(header) // Itt add meg a tényleg elrejteni kívánt mezőket
    );
  };

  const renderCell = (row, key) => {
    if (editingId === row.id && activeTable === "Users") {
      return (
        <input
          type="text"
          name={key}
          value={editForm[key] || ""}
          onChange={handleInputChange}
          className="database-edit-input"
        />
      );
    }
  
    // Képek speciális kezelése
    if (key === "profilePicture") {
      if (!row[key]) {
        return <span>No image</span>;
      }

      return (
        <img 
          src={row[key]} 
          className="database-profile-picture"
      
        />
      );
    }
  
    return row[key]?.toString();
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <FaSort className="database-sort-icon" />;
    return sortConfig.direction === "ascending" ? (
      <FaSortUp className="database-sort-icon" />
    ) : (
      <FaSortDown className="database-sort-icon" />
    );
  };

  const buttonVariants = {
    initial: { backgroundPosition: "100% 0" },
    hover: { backgroundPosition: "0 0" },
    tap: { scale: 0.95 },
  };

  return (
    <div className="database-container">
    {/* Updated table selector with responsive layout */}
    <div className="database-table-selector-container">
      <div className="database-table-selector">
        {tables.map((table) => (
          <button
            key={table.id}
            className={`database-table-tab ${
              activeTable === table.name ? "active" : ""
            }`}
            onClick={() => handleTableChange(table.name)}
          >
            <FaTable className="database-table-icon" />
            <span className="database-table-name">{table.displayName}</span>
          </button>
        ))}
      </div>
    </div>

      {loading && (
        <div className="database-loading">
          <FaSpinner className="database-spinner" /> Loading data...
        </div>
      )}

      {error && (
        <div className="database-error">
          Error loading data from {apiEndpoints[activeTable]}
          <p>{error.message}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="database-toolbar">
            <div className="database-search-box">
              <FaSearch className="database-search-icon" />
              <input
                type="text"
                placeholder={`Search ${
                  tables
                    .find((t) => t.name === activeTable)
                    ?.displayName.replace(" Table", "") || activeTable
                }...`}
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="database-table-info">
              {filteredData.length} records | Page {currentPage} of {totalPages}
            </div>
          </div>

          <div className="database-table-viewport" ref={tableRef}>
            <div className="database-table-container">
              {data.length > 0 ? (
                <table className="database-table">
                  <thead ref={theadRef}>
                    <tr>
                      {getTableHeaders().map((header) => (
                        <th key={header} onClick={() => requestSort(header)}>
                          <div className="database-header-content">
                            {header}
                            {renderSortIcon(header)}
                          </div>
                        </th>
                      ))}
                      {activeTable === "Users" && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row) => (
                      <tr key={row.id}>
                        {getTableHeaders().map((key) => (
                          <td key={key}>
                            {activeTable === "UserActivity" &&
                            key.endsWith("_id") ? (
                              <span className="database-id-cell">
                                {row[key]}
                              </span>
                            ) : (
                              renderCell(row, key)
                            )}
                          </td>
                        ))}
                        {activeTable === "Users" && (
                          <td className="database-actions">
                            {editingId === row.id ? (
                              <div className="database-button-group">
                                <motion.button
                                  variants={buttonVariants}
                                  initial="initial"
                                  whileHover="hover"
                                  whileTap="tap"
                                  className="database-save-btn"
                                  onClick={handleSave}
                                >
                                  <span className="database-button-content">
                                    Save
                                  </span>
                                </motion.button>
                                <motion.button
                                  variants={buttonVariants}
                                  initial="initial"
                                  whileHover="hover"
                                  whileTap="tap"
                                  className="database-cancel-btn"
                                  onClick={handleCancelEdit}
                                >
                                  <span className="database-button-content">
                                    Cancel
                                  </span>
                                </motion.button>
                              </div>
                            ) : (
                              <div className="database-action-buttons">
                                <motion.button
                                  variants={buttonVariants}
                                  initial="initial"
                                  whileHover="hover"
                                  whileTap="tap"
                                  className="database-edit-btn"
                                  onClick={() => handleEdit(row.id)}
                                >
                                  <FaEdit />
                                </motion.button>
                                <motion.button
                                  variants={buttonVariants}
                                  initial="initial"
                                  whileHover="hover"
                                  whileTap="tap"
                                  className="database-delete-btn"
                                  onClick={() => handleDelete(row.id)}
                                >
                                  <FaTrash />
                                </motion.button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="database-no-data">No data available</div>
              )}
            </div>
          </div>

          <div className="database-pagination">
            <button
              className="database-prev-btn"
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              className="database-next-btn"
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DatabaseTables;
