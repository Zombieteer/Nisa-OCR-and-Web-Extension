import axios from "axios";
import React, { useState } from "react";

const Encrypt = ({ API_ENDPOINT, user }) => {
  const [toggleDetails, setToggleDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [mailSender, setMailSender] = useState("");
  const [encryptedHash, setEncryptedHash] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

  const _onClickHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("email", JSON.parse(localStorage.getItem("authUser")).email);
    data.append("mailSender", mailSender);

    axios
      .post(`${API_ENDPOINT}/api/send`, data, {
        // receive two parameter endpoint url ,form data
        responseType: "blob",
      })
      .then((res) => {
        if (res.headers["content-type"].split(";")[0] === "application/json") {
          setLoading(false);
          alert("Encryption failed, either file limit or file size exceeded");
          return;
        }
        setLoading(false);
        console.log(res);
        const file = new Blob([res.data]);
        const url = window.URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        console.log(res.headers);
        link.setAttribute("download", "Nisa Protected.pdf");
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const _onChangeHandler = (event) => {
    setFile(event.target.files[0]);
  };
  return (
    <div className="p-4">
      <h1 className="px-4 mb-4 text-2xl">Encrypt a new file</h1>
      <h1 className="px-4 mb-4 text-xl text-gray-700">
        {user && user.file_limit - user.total_files + " files left to encrypt"}
      </h1>
      <div className="grid grid-cols-2">
        <form>
          <div className="container flex flex-col p-4 md:max-w-xl">
            <label className="text-gray-700">Upload a PDF document</label>
            <label className="flex flex-col items-center px-4 py-6 mb-4 tracking-wide text-gray-700 bg-white border rounded-lg shadow cursor-pointer border-blue hover:bg-blue hover:text-gray-800">
              <svg
                className="w-8 h-8"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
              </svg>
              <span className="mt-2 text-base leading-normal">
                {file ? file.name : "Select a file"}
              </span>
              <input
                name="file"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={_onChangeHandler}
              />
            </label>
            <label className="block mb-4">
              <span className="text-gray-700">
                Email address from which file was recieved:
              </span>
              <input
                type="email"
                className="block w-full mt-1 form-input"
                placeholder="faraz@codalyze.com"
                value={mailSender}
                onChange={(e) => setMailSender(e.target.value)}
              />
            </label>

            <button
              type="submit"
              onClick={_onClickHandler}
              className="flex items-center justify-center px-4 py-2 text-white bg-gray-800 rounded shadow "
              disabled={loading}
            >
              {loading ? "Please wait..." : "Encrypt file"}
            </button>
          </div>
        </form>

        {loading && <div className="loader">Loading...</div>}
      </div>
      {/* {toggleDetails && (
          <div>
            <div>
              <h3>Encrypted Content</h3>
              <textarea className="form-textarea" name="" id="" cols="30" rows="10" value={encryptedHash} />
            </div>
            <div>
              <h3>Decryption Key</h3>
              <code>{publicKey}</code>
            </div>
          </div>
        )} */}
    </div>
  );
};

export default Encrypt;
