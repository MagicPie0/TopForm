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
  FaCheck,
  FaTimes,
  FaUser,
  FaServer,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import "./ComponentsStyles/DatabaseTables.css";
import useFetch from "./Hooks/useAllTable.jsx";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@mui/material";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success", 
  });
  const [hoverInfo, setHoverInfo] = useState({
    visible: false,
    userName: "",
    x: 0,
    y: 0,
  });
  const [allTablesData, setAllTablesData] = useState({
    Users: [],
    UserActivity: [],
  });
  const [hoveredRowId, setHoveredRowId] = useState(null);

  const itemsPerPage = 15;

  const apiEndpoints = {
    Users: "https://localhost:7196/api/Admin/User",
    Workouts: "https://localhost:7196/api/Admin/Workout",
    Diets: "https://localhost:7196/api/Admin/Diet",
    Ranks: "https://localhost:7196/api/Admin/Ranks",
    MuscleGroups: "https://localhost:7196/api/Admin/MuscleGroups",
    UserActivity: "https://localhost:7196/api/Admin/UserActivity",
  };

  const [serverError, setServerError] = useState({
    isError: false,
    message: "",
  });

  const { data: usersData, loading: usersLoading } = useFetch(
    apiEndpoints.Users
  );

  const { data: userActivityData, loading: userActivityLoading } = useFetch(
    apiEndpoints.UserActivity
  );

  useEffect(() => {
    if (usersData) {
      const transformedUsers = usersData.map((item) => ({
        id: item.Id || item.id,
        username: item.Username || item.username,
        email: item.Email || item.email,
        name: item.Name || item.name,
        birthDate: item.BirthDate || item.birthDate,
        profilePicture: item.profilePicture
          ? getProfilePicture(item.profilePicture)
          : "No profile picture",
        password: item.password ? "********" : "No password",
        gender: item.men == 0 ? "Male" : "Female",
      }));
      setAllTablesData((prev) => ({ ...prev, Users: transformedUsers }));
    }
  }, [usersData]);

  useEffect(() => {
    if (userActivityData) {
      setAllTablesData((prev) => ({ ...prev, UserActivity: userActivityData }));
    }
  }, [userActivityData]);

  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await axios.delete(
        `https://localhost:7196/api/AdminUserTable/users/${userId}`
      );
      return response.data;
    },
    onSuccess: () => {
      setData(data.filter((item) => item.id !== itemToDelete));
      setNotification({
        open: true,
        message: "User deleted successfully",
        severity: "success",
      });
      setShowDeleteModal(false); 
    },
    onError: (error) => {
      setNotification({
        open: true,
        message: `Delete failed: ${
          error.response?.data?.message || error.message
        }`,
        severity: "error",
      });
    },
    onSettled: () => {
      setShowDeleteModal(false);
      setItemToDelete(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedUser) => {
      try {
        const response = await axios.put(
          `https://localhost:7196/api/AdminUserTable/User/${updatedUser.id}`,
          updatedUser
        );
        console.log(response.data); 
        return response.data;
      } catch (error) {
        if (error.response) {
          console.error("Hiba történt:", error.response.data); 
        } else {
          console.error("Ismeretlen hiba:", error.message);
        }
      }
    },
    onSuccess: () => {
      setNotification({
        open: true,
        message: "User updated successfully",
        severity: "success",
      });
      setEditingId(null);
    },
    onError: (error) => {
      setNotification({
        open: true,
        message: `Update failed: ${
          error.response?.data?.message || error.message
        }`,
        severity: "error",
      });
    },
  });

  const handleRowHover = (recordId) => {
    const currentRecord = data.find((item) => item.id === recordId);

    if (!currentRecord) return null;

    if (activeTable === "Users") {
      return `${currentRecord.name} (${currentRecord.username})`;
    }

    let userId = null;

    if (activeTable === "UserActivity") {
      userId = currentRecord.userId;
    } else {
      const tableToFieldMap = {
        Ranks: "ranksID",
        MuscleGroups: "muscleGroupId",
        Workouts: "workoutId",
        Diets: "dietId",
      };

      let idFieldName;
      if (tableToFieldMap[activeTable]) {
        idFieldName = tableToFieldMap[activeTable];
      } else {
        idFieldName = activeTable.toLowerCase().endsWith("s")
          ? `${activeTable.toLowerCase().slice(0, -1)}Id`
          : `${activeTable.toLowerCase()}Id`;
      }

      console.log(
        `Looking for ${activeTable} record with ID ${recordId} using field ${idFieldName}`
      );

      const activityRecord = allTablesData.UserActivity?.find(
        (activity) => activity[idFieldName] === recordId
      );

      if (activityRecord) {
        userId = activityRecord.userId;
      } else {
        console.log(
          `No matching UserActivity found for ${activeTable} with ID ${recordId}`
        );
      }
    }

    if (userId) {
      const user = allTablesData.Users?.find((u) => u.id === userId);
      if (user) {
        return `${user.name} (${user.username})`;
      } else {
        console.log(`User with ID ${userId} not found`);
      }
    }

    return null;
  };

  const handleRowMouseEvent = (e, rowId) => {
    const eventType = e.type;

    if (eventType === "mouseleave") {
      setHoveredRowId(null);
      hideTooltip();
      return;
    }

    if (hoveredRowId !== rowId) {
      setHoveredRowId(rowId);
      const userName = handleRowHover(rowId);

      if (userName) {
        setHoverInfo({
          visible: true,
          userName: userName,
          x: e.clientX,
          y: e.clientY,
        });
      } else {
        hideTooltip();
      }
    } else if (eventType === "mousemove") {
      setHoverInfo({
        ...hoverInfo,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const hideTooltip = () => {
    setHoverInfo({ ...hoverInfo, visible: false });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const {
    data: fetchedData,
    loading,
    error,
  } = useFetch(apiEndpoints[activeTable]);

  useEffect(() => {
    if (error) {
      if (error.message.includes("500")) {
        setNotification({
          open: true,
          message:
            "Server error occurred. Please try again later or contact support.",
          severity: "error",
        });
      } else if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("ECONNREFUSED")
      ) {
        setNotification({
          open: true,
          message:
            "Cannot connect to server. Please make sure the backend service is running.",
          severity: "error",
        });
      } else {
        setNotification({
          open: true,
          message: `Error loading data: ${error.message}`,
          severity: "error",
        });
      }
    }
  }, [error]);

  const handleRetry = () => {
    setServerError({ isError: false, message: "" });
    refetch();
  };

  const getProfilePicture = (item) => {
    if (!item) return "No profile picture";
    const mimeType = item.startsWith("/9j/") ? "jpeg" : "png";
    return `data:image/${mimeType};base64,${item}`;
  };

  useEffect(() => {
    if (fetchedData) {
      const transformedData = fetchedData.map((item) => {
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
        if (activeTable === "Users") {
          return {
            id: item.Id || item.id,
            username: item.Username || item.username,
            email: item.Email || item.email,
            name: item.Name || item.name,
            birthDate: item.BirthDate || item.birthDate,
            profilePicture: item.profilePicture
              ? getProfilePicture(item.profilePicture)
              : "No profile picture",
            password: item.password ? "********" : "No password",
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
    const updatedUser = {
      id: editingId,
      Username: editForm.username,
      Email: editForm.email,
      Name: editForm.name,
      Men:
        editForm.gender === "Male"
          ? 0
          : editForm.gender === "Female"
          ? 1
          : null,
    };
    console.log("Frissített felhasználó:", updatedUser);

    if (updatedUser.Men === null) {
      console.error("Hibás gender érték");
      return; 
    }

    updateMutation.mutate(updatedUser);
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(itemToDelete);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
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

    if (activeTable === "UserActivity") {
      return headers;
    }

    return headers.filter(
      (header) => !["internal_field1", "internal_field2"].includes(header)
    );
  };

  const renderCell = (row, key) => {
    if (editingId === row.id && activeTable === "Users") {
      switch (key) {
        case "username":
        case "email":
        case "name":
          return (
            <input
              type="text"
              name={key}
              value={editForm[key] || ""}
              onChange={handleInputChange}
              className="database-edit-input"
            />
          );
        case "gender":
          return (
            <select
              name="gender"
              value={editForm.gender || "Male"}
              onChange={handleInputChange}
              className="database-edit-input"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          );
        case "profilePicture":
          return (
            <img
              src={row[key] || ""}
              alt="Profile"
              className="database-profile-picture"
            />
          );

        default:
          return row[key]?.toString();
      }
    }

    if (key === "profilePicture") {
      if (!row[key]) {
        return <span>No image</span>;
      }
      return <img src={row[key]} className="database-profile-picture" />;
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
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const actionButtonVariants = {
    initial: { scale: 1, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
    hover: { scale: 1.1, boxShadow: "0 4px 8px rgba(0,0,0,0.2)" },
    tap: { scale: 0.95, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  };

  const tooltipStyle = {
    position: "fixed",
    top: `${hoverInfo.y + 10}px`,
    left: `${hoverInfo.x + 10}px`,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "8px 12px",
    borderRadius: "4px",
    zIndex: 1000,
    display: hoverInfo.visible ? "flex" : "none",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    fontSize: "14px",
  };

  return (
    <div className="database-container">
      {!loading && error && (
        <div className="database-error">
          <div className="database-error-header">
            <FaExclamationTriangle className="database-error-icon" />
            <h3>Error Loading Data</h3>
          </div>
          <div className="database-error-body">
            {error.message.includes("500") ? (
              <>
                <p>The server encountered an unexpected error (500).</p>
                <p>Possible causes:</p>
                <ul>
                  <li>Backend service is not properly configured</li>
                  <li>Database connection issues</li>
                  <li>Internal server error</li>
                </ul>
              </>
            ) : (
              <p>{error.message}</p>
            )}
            <p className="database-error-endpoint">
              Attempted endpoint: {apiEndpoints[activeTable]}
            </p>
          </div>
          <button
            className="database-retry-button"
            onClick={() => window.location.reload()}
          >
            <FaSpinner
              className={
                loading ? "database-spinner rotating" : "database-spinner"
              }
            />
            Retry
          </button>
        </div>
      )}
      <div style={tooltipStyle}>
        <FaUser /> {hoverInfo.userName}
      </div>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      {showDeleteModal && (
        <div className="database-modal-overlay">
          <div className="database-modal">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </p>

            {deleteMutation.isError && (
              <div className="database-modal-error">
                Error: {deleteMutation.error.message}
              </div>
            )}

            <div className="database-modal-actions">
              <motion.button
                className="database-modal-cancel"
                onClick={cancelDelete}
                whileHover={{ backgroundColor: "#f0f0f0" }}
                whileTap={{ scale: 0.95 }}
                disabled={deleteMutation.isPending}
              >
                <FaTimes /> Cancel
              </motion.button>
              <motion.button
                className="database-modal-confirm"
                onClick={confirmDelete}
                whileHover={{ backgroundColor: "#ffebee" }}
                whileTap={{ scale: 0.95 }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <FaSpinner className="database-spinner" />
                ) : (
                  <>
                    <FaTrash /> Delete
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      )}
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
                      <tr
                        key={row.id}
                        onMouseEnter={(e) => handleRowMouseEvent(e, row.id)}
                        onMouseMove={(e) => handleRowMouseEvent(e, row.id)}
                        onMouseLeave={(e) => handleRowMouseEvent(e, row.id)}
                        className="database-table-row"
                      >
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
                                  className="database-save-btn"
                                  onClick={handleSave}
                                  variants={actionButtonVariants}
                                  initial="initial"
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                  <FaCheck className="database-action-icon" />
                                  <span className="database-button-text">
                                    Save
                                  </span>
                                </motion.button>
                                <motion.button
                                  className="database-cancel-btn"
                                  onClick={handleCancelEdit}
                                  variants={actionButtonVariants}
                                  initial="initial"
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                  <FaTimes className="database-action-icon" />
                                  <span className="database-button-text">
                                    Cancel
                                  </span>
                                </motion.button>
                              </div>
                            ) : (
                              <div className="database-action-buttons">
                                <motion.button
                                  className="database-edit-btn"
                                  onClick={() => handleEdit(row.id)}
                                  variants={actionButtonVariants}
                                  initial="initial"
                                  whileHover="hover"
                                  whileTap="tap"
                                  title="Edit"
                                >
                                  <FaEdit className="database-action-icon" />
                                </motion.button>
                                <motion.button
                                  className="database-delete-btn"
                                  onClick={() => handleDeleteClick(row.id)}
                                  variants={actionButtonVariants}
                                  initial="initial"
                                  whileHover="hover"
                                  whileTap="tap"
                                  title="Delete"
                                >
                                  <FaTrash className="database-action-icon" />
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
            <motion.button
              className="database-prev-btn"
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              whileHover={{
                backgroundColor: currentPage === 1 ? "#f0f0f0" : "#e0e0e0",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Prev
            </motion.button>
            <motion.button
              className="database-next-btn"
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              whileHover={{
                backgroundColor:
                  currentPage === totalPages ? "#f0f0f0" : "#e0e0e0",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
};

export default DatabaseTables;
