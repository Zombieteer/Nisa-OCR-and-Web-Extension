import { AgGridReact } from "ag-grid-react/lib/agGridReact";
import axios from "axios";
import React, { useEffect, useState } from "react";
import AddModal from "./AddModal";
import UserEditRenderer from "./UserEditRenderer";

function RegisteredUser({ API_ENDPOINT }) {
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [rowInWork, setRowInWork] = useState(null);

  // frameworks renderers
  const [cellRenderers, setCellRenderers] = useState({
    userEditRenderer: UserEditRenderer,
  });

  const editRow = (item) => {
    setRowInWork(item);
    openAddModal();
  };

  //row data
  const [rowData, setRowData] = useState();

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/users/core`)
      .then((res) => {
        setRowData(
          res.data.users.map((user) => {
            user.is_subscribed
              ? (user.is_subscribed = true)
              : (user.is_subscribed = false);
            return user;
          })
        );
      })
      .catch((e) => alert("Error in fetching Users please refresh the page"));
  }, []);

  // columndefs
  const columnDefs = [
    {
      headerName: "Name",
      field: "name",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      sortable: true,
      editable: false,
      pinned: "left",
      lockPinned: true,
    },
    {
      headerName: "Email",
      field: "email",
      sortable: true,
      editable: false,
    },
    {
      headerName: "Role Type",
      field: "role",
      sortable: true,
      editable: false,
    },
    {
      headerName: "Number of Files Encrypted",
      field: "total_files",
      sortable: true,
      editable: false,
    },
    {
      headerName: "Subscribed",
      field: "is_subscribed",
      pinned: "right",
      sortable: false,
      filter: false,
      editable: false,
      resizable: false,
      lockPinned: true,
    },
    {
      headerName: "",
      field: "#",
      pinned: "right",
      sortable: false,
      filter: false,
      editable: false,
      resizable: false,
      lockPinned: true,
      cellRenderer: "userEditRenderer",
      width: 59,
      cellRendererParams: { editRow },
    },
  ];

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onFirstDataRendered = (params) => {
    var allColumnIds = [];
    gridColumnApi.getAllColumns().forEach(function (column) {
      column.colId !== "#" && allColumnIds.push(column.colId);
    });
    gridColumnApi.autoSizeColumns(allColumnIds);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setRowInWork(null);
  };

  const saveClient = async (userDetails) => {
    for (var i in userDetails) {
      if (userDetails[i] === "") {
        return;
      }
    }
    if (!rowInWork) {
      let res = await axios.post(`${API_ENDPOINT}/api/register`, {
        ...userDetails,
        is_subscribed: userDetails.is_subscribed === "true" ? 1 : 0,
      });
      if (res.data.msg === "User added") {
        let transactions = {
          add: [userDetails],
          addIndex: 0,
        };
        gridApi.applyTransaction(transactions);
        closeAddModal();
      } else {
        alert("User email already exists");
      }
    } else {
      console.log(userDetails);
      let res = await axios.post(`${API_ENDPOINT}/api/updateUser`, {
        ...userDetails,
        is_subscribed: userDetails.is_subscribed === "true" ? 1 : 0,
      });
      if (res.data.status === "success") {
        gridApi.forEachNodeAfterFilterAndSort((rowNode, index) => {
          if (rowNode.rowIndex === rowInWork.node.rowIndex) {
            let data = rowNode;
            data.data = userDetails;
            gridApi.applyTransaction({
              update: [data],
            });
            return;
          }
        });
        closeAddModal();
      } else {
        alert("something went wrong, try later");
      }
    }
  };

  const deleteSelected = async () => {
    console.log(gridApi.getSelectedNodes());
    let selectedRows = gridApi.getSelectedNodes();
    if (selectedRows.length) {
      let toDelete = [];
      let emails = [];
      selectedRows.forEach((row, id) => {
        if (row.data.role === "user") {
          toDelete.push(row.data);
          emails.push(row.data.email);
        }
      });
      if (emails.length) {
        let res = await axios.post(`${API_ENDPOINT}/api/deleteUsers`, emails);
        if (res.data.status === "success") {
          gridApi.applyTransaction({
            remove: toDelete,
          });
        } else {
          alert("Something went wrong, try again later");
        }
      } else {
        alert('Admin user cannot be deleted')
      }
    }
  };

  return (
    <div className="flex-auto">
      <div className="flex justify-between  mt-5 mb-5 pl-8 pr-8">
        <h2 className="text-2xl">Registered Users</h2>
        <div className="flex ">
          <button
            type="submit"
            onClick={openAddModal}
            className="flex items-center justify-center px-4 py-2 text-white bg-gray-800 rounded shadow"
          >
            Add User
          </button>
          <button
            onClick={deleteSelected}
            className="flex items-center justify-center ml-3 px-4 py-2 text-white bg-gray-800 rounded shadow"
          >
            Delete Selected
          </button>
        </div>
      </div>
      <div
        className="ag-theme-alpine"
        style={{ height: 500, width: 900, margin: "auto" }}
      >
        <AgGridReact
          rowData={rowData}
          defaultColDef={{
            floatingFilter: true,
            filter: true,
            resizable: true,
          }}
          animateRows
          onGridReady={onGridReady}
          columnDefs={columnDefs}
          rowSelection="multiple"
          onFirstDataRendered={onFirstDataRendered}
          frameworkComponents={cellRenderers}
        />
      </div>
      <AddModal
        saveClient={saveClient}
        rowInWork={rowInWork}
        isAddModalOpen={isAddModalOpen}
        closeAddModal={closeAddModal}
      />
    </div>
  );
}

export default RegisteredUser;
