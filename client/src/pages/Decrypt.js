import axios from "axios";
import React, { useEffect, useState } from "react";

const Decrypt = ({ API_ENDPOINT }) => {
  const [encryptedHash, setEncryptedHash] = useState(null);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [secretContent, setSecretContent] = useState(false);
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [sender, setSender] = useState("");
  const [error, setError] = useState(null);
  const [verify, setVerify] = useState(null);

  const _onChangeHandler = (event) => {
    setFile(event.target.files[0]);
  };

  const _onClickHandler = async (event) => {
    console.log("sender is ");
    console.log(sender);

    console.log("users is ");
    console.log(users);
    event.preventDefault();
    if (!file || !sender) {
      alert("Please select a file and the person you received the file from");
      return;
    }
    // if(!users.includes(sender)) {
    //   alert('Please select a sender from the suggestions')
    //   return
    // }
    if (loading) {
      alert("Request already in progress");
      return;
    }
    setLoading(true);
    setVerify(false);
    setSecretContent(null);
    setError(null);

    const data = new FormData();
    data.append("file", file);
    data.append("email", sender);
    console.log(file, sender);
    axios.post(`${API_ENDPOINT}/api/receive`, data, {}).then((res) => {
      if (res.data.status === "ok") {
        setVerify(true);
        console.log(res.data);
      } else {
        setError(res.data.error);
      }
      console.log(res);
      setLoading(false);
    });
  };
  console.log("panel", API_ENDPOINT);

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/users`)
      .then((res) => {
        console.log(res.data.users.map((item) => item.email))
        setUsers(res.data.users.map((item) => item.email));
        setFetchingUsers(false);
      })
      .catch((e) => alert("Error in fetching Users please refresh the page"));
  }, []);

  // useEffect(() => {
  //   if (sender && users)
  //     setSuggestions(users.filter((user) => user.includes(sender)));
  // }, [users, sender]);

  return (
    <div className="p-4">
      <h1 className="px-4 mb-4 text-2xl">Decrypt a received document file</h1>
      <div className="grid grid-cols-2">
        <form>
          <div className="container flex flex-col p-4 md:max-w-xl">
            <label className="text-gray-700">Upload received file</label>
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
                className="hidden"
                onChange={_onChangeHandler}
              />
            </label>

            <label className="text-gray-700">Sender's email</label>
            <div className="relative w-full">
              <input
                type="text"
                className="w-full form-input"
                placeholder="Enter an email address"
                value={
                  // fetchingUsers
                  //   ? `Please wait as the data is loaded...`
                  //   :
                  sender
                }
                onChange={(e) => setSender(e.target.value)}
              />
              <div
                className={`absolute top-0 right-0 flex items-center justify-between h-full mx-2 text-gray-500   cursor-pointer ${
                  sender ? "block" : "hidden"
                }`}
                onClick={(e) => setSender("")}
              >
                <svg
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="flex-shrink-0 w-6 h-6"
                >
                  <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              {/* {suggestions && (
                  <div className="absolute left-0 w-64 py-2 space-y-1 bg-white border rounded shadow-xl bottom-full">
                    {suggestions &&
                      suggestions.map((item) => (
                        <SenderSuggestionItem
                          setSender={setSender}
                          setSuggestions={setSuggestions}
                        >
                          {item}
                        </SenderSuggestionItem>
                      ))}
                  </div>
                )} */}
            </div>

            <button
              type="submit"
              onClick={_onClickHandler}
              className="flex items-center justify-center px-4 py-2 mt-4 text-white bg-gray-800 rounded shadow "
            >
              Decrypt file
            </button>
          </div>
        </form>

        {loading && <div className="loader">Loading...</div>}
        {error && (
          <div className="w-full ">
            <div className="flex items-center px-4 py-4 font-bold text-red-600 bg-red-200 rounded">
              <span>{error}</span>
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                className="flex-shrink-0 w-6 h-6 ml-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        )}
        {verify && (
          <div className="w-full ">
            <div className="flex items-center px-4 py-4 font-bold text-green-600 bg-green-200 rounded">
              <span> The document is verified and not tampered! </span>
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                className="w-6 h-6 ml-4"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        )}
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

export default Decrypt;
