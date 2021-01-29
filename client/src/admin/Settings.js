import axios from "axios";
import React, { useEffect, useState } from "react";

const Settings = ({ API_ENDPOINT }) => {
  const [nonSubSettings, setNonSubSettings] = useState({
    filesize_limit: "",
    file_limit: "",
  });

  const [subSettings, setSubSettings] = useState({
    filesize_limit: "",
    file_limit: "",
  });

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/subscriptionSettings`)
      .then((res) => {
        setNonSubSettings(res.data.settings.nonSubSet);
        setSubSettings(res.data.settings.subSet);
        console.log(res.data.settings);
      })
      .catch((error) =>
        alert("Error in fetching Users please refresh the page")
      );
  }, []);

  const onChangeNonSub = (e) => {
    setNonSubSettings({
      ...nonSubSettings,
      [e.target.name]: Number(e.target.value),
    });
  };

  const onChangeSub = (e) => {
    setSubSettings({ ...subSettings, [e.target.name]: Number(e.target.value) });
  };

  const updateSettings = async (e) => {
    e.preventDefault();
    axios
      .post(`${API_ENDPOINT}/api/subscriptionSettings`, {
        subSettings,
        nonSubSettings,
      })
      .then((res) => {
        alert(res.data.msg);
      })
      .catch((error) =>
        alert("Error in fetching data please refresh the page")
      );
  };

  return (
    <div className="flex-auto pl-8 pr-8">
      <div className="mt-5 mb-5 ">
        <h2 className="text-2xl">Non Subscribed Users Settings</h2>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="mb-3 pt-0">
          <label className="block">
            <span className="text-gray-700">Maximum File Size Allowed</span>
            <input
              name="filesize_limit"
              type="number"
              value={nonSubSettings.filesize_limit}
              onChange={onChangeNonSub}
              className="form-input mt-3 block w-full"
              placeholder="Enter maximum file size"
            />
            <div className="text-gray-700 pt-1">in KB</div>
          </label>
        </div>
        <div className="mb-3 pt-0">
          <label className="block">
            <span className="text-gray-700">No of Files Allowed</span>
            <input
              name="file_limit"
              type="number"
              value={nonSubSettings.file_limit}
              onChange={onChangeNonSub}
              className="form-input mt-3 block w-full"
              placeholder="Enter number of files allowed"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 mb-5 ">
        <h2 className="text-2xl">Subscribed Users Settings</h2>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="mb-3 pt-0">
          <label className="block">
            <span className="text-gray-700">Maximum File Size Allowed</span>
            <input
              name="filesize_limit"
              type="number"
              value={subSettings.filesize_limit}
              onChange={onChangeSub}
              className="form-input mt-3 block w-full"
              placeholder="Enter maximum file size"
            />
            <div className="text-gray-700 pt-1">in KB</div>
          </label>
        </div>
        <div className="mb-3 pt-0">
          <label className="block">
            <span className="text-gray-700">No of Files Allowed</span>
            <input
              name="file_limit"
              type="number"
              value={subSettings.file_limit}
              onChange={onChangeSub}
              className="form-input mt-3 block w-full"
              placeholder="Enter number of files allowed"
            />
          </label>
        </div>
      </div>
      <div className='mt-5'>
        <button
          className="flex items-center justify-between px-4 py-2 text-white bg-gray-800 rounded shadow"
          onClick={updateSettings}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default Settings;
