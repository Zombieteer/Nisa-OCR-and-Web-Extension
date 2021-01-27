import React, { Fragment, useEffect, useState } from "react";

const AddModal = ({ saveClient, rowInWork, isAddModalOpen, closeAddModal }) => {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    role: "user",
    total_files: 0,
    is_subscribed: false,
  });

  useEffect(() => {
    rowInWork
      ? setUserDetails(rowInWork.node.data)
      : setUserDetails({
          name: "",
          email: "",
          role: "user",
          total_files: 0,
          is_subscribed: false,
        });
  }, [rowInWork]);

  const roleTypes = [
    { label: "Admin", value: "admin" },
    { label: "Non-Admin", value: "user" },
  ];
  const subsTypes = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  const onChange = (e) => {
    console.log(e.target.name);
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
    console.log(userDetails);
  };

  const Dropdown = ({ name, value, label, options }) => {
    return (
      <label className="block mt-4">
        <span className="text-gray-700">{label}</span>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="form-select mt-1 block w-full"
        >
          {options.map((option, id) => (
            <option value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
    );
  };

  return (
    <>
      {isAddModalOpen ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}

              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}

                <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
                  <h6 className="text-2xl">Add User</h6>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => closeAddModal()}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}

                <div className="relative py-3 px-6 flex-auto">
                  <Fragment>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="mb-3 pt-0">
                          <label className="block">
                            <span className="text-gray-700">Name</span>
                            <input
                              name="name"
                              value={userDetails.name}
                              onChange={onChange}
                              className="form-input mt-1 block w-full"
                              placeholder="Enter Name"
                            />
                          </label>
                        </div>
                        <div className="mb-3 pt-0">
                          <Dropdown
                            name="role"
                            value={userDetails.role}
                            label="Role Type"
                            options={roleTypes}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-3 pt-0">
                          <label className="block">
                            <span className="text-gray-700">Email</span>
                            <input
                              name="email"
                              value={userDetails.email}
                              onChange={onChange}
                              className="form-input mt-1 block w-full"
                              placeholder="Enter Email"
                            />
                          </label>
                        </div>
                        <div className="mb-3 pt-0">
                          <Dropdown
                            name="is_subscribed"
                            value={userDetails.is_subscribed}
                            label="Subscribed"
                            options={subsTypes}
                          />
                        </div>
                      </div>
                    </div>
                  </Fragment>
                </div>
                {/*footer*/}

                <div className="flex items-center justify-end p-6 rounded-b">
                  <button
                    onClick={() => closeAddModal()}
                    className="flex items-center justify-center px-4 py-2 text-white bg-gray-800 rounded shadow mr-1 mb-1"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => saveClient(userDetails)}
                    className="flex items-center justify-center px-4 py-2 text-white bg-gray-800 rounded shadow mr-1 mb-1"
                  >
                    {rowInWork ? "Update" : "Add"} and Save
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
};

export default AddModal;
