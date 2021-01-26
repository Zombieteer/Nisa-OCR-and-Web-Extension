import React, { useState } from "react";

const Settings = () => {
  const [settings, setSettings] = useState({
    min: "",
    max: "",
    files: "",
  });

  const onChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-auto pl-8 pr-8">
      <div className="mt-5 mb-5 ">
        <h2 className="text-2xl">Non Subscribed Users Settings</h2>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="mb-3 pt-0">
          <label className="block">
            <span className="text-gray-700">Minimum File Size Allowed</span>
            <input
              name="min"
              type="number"
              value={settings.min}
              onChange={onChange}
              className="form-input mt-3 block w-full"
              placeholder="Enter minimum file size "
            />
            <div className="text-gray-700 pt-1">in MB</div>
          </label>
        </div>
        <div className="mb-3 pt-0">
          <label className="block">
            <span className="text-gray-700">Maximum File Size Allowed</span>
            <input
              name="max"
              type="number"
              value={settings.max}
              onChange={onChange}
              className="form-input mt-3 block w-full"
              placeholder="Enter maximum file size "
            />
            <div className="text-gray-700 pt-1">in MB</div>
          </label>
        </div>
        <div className="mb-3 pt-0">
          <label className="block">
            <span className="text-gray-700">No of Files Allowed</span>
            <input
              name="files"
              type="number"
              value={settings.files}
              onChange={onChange}
              className="form-input mt-3 block w-full"
              placeholder="Enter number of files allowed"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
