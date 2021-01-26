import React, { useState, useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  Redirect,
  useHistory,
} from "react-router-dom";
import firebase from "firebase";
import firebaseConfig from "./firebase.config.js";
import axios from "axios";
import "./Loader.css";

import HeroSvg from "./HeroSvg";
import AdminPanel from "./admin";

firebase.initializeApp(firebaseConfig);

export const AuthContext = React.createContext(null);

const API_ENDPOINT =
  process.env.REACT_APP_API_ENDPOINT || `http://localhost:3001`;

function App() {
  const [isOpen, setIsOpen] = useState(false);
  // is true on every load so commented for now
  // const [isLoggedIn, setIsLoggedIn] = useState(firebase.auth.Auth.Persistence.LOCAL)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  console.log("Current user");
  console.log(firebase.auth().currentUser);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        setIsLoggedIn(true);
        localStorage.setItem("authUser", JSON.stringify(authUser));
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem("authUser");
      }
    });
    console.log(firebase.auth().currentUser);
  }, []);

  useEffect(() => {
    console.log("is logged in ");
    console.log(isLoggedIn);
  }, [isLoggedIn]);

  return (
    <div className="">
      <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        <Router>
          <header>
            <div className="shadow">
              <div className="container w-full py-2 mx-auto mb-2 text-gray-800 ">
                <div className="flex flex-col justify-between px-4 font-medium tracking-wide md:flex-row ">
                  <div className="flex items-center mt-4 md:mt-0">
                    <Link to="/" className="flex items-center ">
                      <svg
                        viewBox="0 0 32 32"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="w-8 h-8"
                      >
                        <path
                          d="M28 11v11M22 3v26M16 11v11M10 3v26M4 11v11"
                          transform="translate(16, 16) rotate(45) scale(.75, 1) translate(-16, -16)"
                        />
                      </svg>
                      <span
                        className="px-2 text-2xl rounded md:my-4 md:mr-4"
                        href="#"
                      >
                        NISA Project OCR
                      </span>
                    </Link>
                  </div>
                  <ul
                    className={`flex ml-auto flex-1 flex-col md:flex-row  md:mt-0 mt-2 md:mb-0 mb-2 md:ml-auto list-disc md:list-none md:flex ${
                      isOpen ? "block" : "hidden"
                    }`}
                  >
                    <li className="pb-2 md:mx-3 md:py-6">
                      <NavLink
                        className="text-gray-900 hover:text-gray-700 focus:text-gray-700"
                        to="/"
                      >
                        Home
                      </NavLink>
                    </li>
                    <li className="pb-2 md:mx-3 md:py-6">
                      <NavLink
                        className="text-gray-900 hover:text-gray-700 focus:text-gray-700"
                        to="/encrypt"
                      >
                        Encrypt
                      </NavLink>
                    </li>
                    <li className="pb-2 md:mx-3 md:py-6">
                      <NavLink
                        className="text-gray-900 hover:text-gray-700 focus:text-gray-700"
                        to="/verify"
                      >
                        Decrypt
                      </NavLink>
                    </li>

                    <li className="pb-2 md:mx-3 md:py-6 md:ml-auto">
                      {!isLoggedIn ? (
                        <NavLink
                          className="text-gray-900 hover:text-gray-700 focus:text-gray-700"
                          to="/login"
                        >
                          Log In
                        </NavLink>
                      ) : (
                        <button
                          className="font-semibold text-gray-900 hover:text-gray-700 focus:text-gray-700"
                          onClick={() => {
                            firebase
                              .auth()
                              .signOut()
                              .then(function () {
                                setIsLoggedIn(false);
                                // wipe from persistent storage
                                // Sign-out successful.
                              })
                              .catch(function (error) {
                                // An error happened.
                              });
                          }}
                        >
                          Log Out
                        </button>
                      )}
                    </li>
                  </ul>
                  <button
                    className="absolute top-0 right-0 px-1 m-5 text-gray-900 rounded md:hidden hover:text-gray-700 focus:text-gray-700"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6"
                    >
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </header>
          <div className="container mx-auto">
            <Switch>
              <Route path="/" exact>
                <Home />
              </Route>

              <Route path="/admin-panel">
                <AdminPanel />
              </Route>

              <ProtectedRoute exact path="/encrypt" component={Encrypt} />

              <Route path="/encrypt" exact>
                <Encrypt />
              </Route>
              <Route path="/verify" exact>
                <Verify />
              </Route>

              <Route path="/login" exact>
                <Login />
              </Route>

              <Route path="/register" exact>
                <Register />
              </Route>
            </Switch>
          </div>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

const Home = () => {
  return (
    <div className="container flex flex-col items-center h-full px-8 mx-auto md:flex-row">
      <div className="flex-1 py-32">
        <h2 className="text-4xl font-bold ">
          Encrypt and Verify your documents using cryptography techniques
        </h2>
        {/* // Google button */}
      </div>
      <div className="flex-1">
        <HeroSvg className="mx-auto h-72" />
      </div>
    </div>
  );
};

const Encrypt = () => {
  const [toggleDetails, setToggleDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [encryptedHash, setEncryptedHash] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

  const _onClickHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("email", JSON.parse(localStorage.getItem("authUser")).email);

    axios
      .post(`${API_ENDPOINT}/api/send`, data, {
        // receive two parameter endpoint url ,form data
        responseType: "blob",
      })
      .then((res) => {
        setLoading(false);
        console.log(res);
        const file = new Blob([res.data]);
        const url = window.URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        console.log(res.headers);
        link.setAttribute("download", "encrypted.pdf");
        document.body.appendChild(link);
        link.click();
      });
  };

  const _onChangeHandler = (event) => {
    setFile(event.target.files[0]);
  };
  return (
    <div className="p-4">
      <h1 className="px-4 mb-4 text-2xl">Encrypt a new file</h1>
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

// const SenderSuggestionItem = ({ setSender, setSuggestions, children }) => {
//   return (
//     <div
//       className="flex items-center px-2 py-1 mx-2 text-gray-700 rounded cursor-pointer hover:bg-gray-300"
//       onClick={(e) => {
//         setSender(e.target.innerText);
//         setSuggestions(null);
//       }}
//     >
//       <svg
//         fill="currentColor"
//         viewBox="0 0 20 20"
//         className="flex-shrink-0 w-6 h-6 mr-4"
//       >
//         <path
//           fill-rule="evenodd"
//           d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
//           clip-rule="evenodd"
//         ></path>
//       </svg>
//       <span></span>
//       {children}
//     </div>
//   );
// };

const Verify = () => {
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

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/users`)
      .then((res) => {
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const Auth = useContext(AuthContext);
  const history = useHistory();

  const login = (e) => {
    e.preventDefault();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    if (email.trim() && password.trim()) {
      firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(function () {
          return firebase
            .auth()
            .signInWithPopup(provider)
            .then(function (result) {
              firebase
                .auth()
                .signInWithEmailAndPassword(email, password)
                .then((res) => {
                  if (res.user) {
                    Auth.setIsLoggedIn(true);
                    history.push("/");
                  }
                });
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    } else alert("Validation Error");
  };

  const authGoogle = (e) => {
    e.preventDefault();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(function () {
        return firebase
          .auth()
          .signInWithPopup(provider)
          .then(function (result) {
            Auth.setIsLoggedIn(true);
            history.push("/");
            // This gives you a Google Access Token.
            const token = result.credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            const email = user.email;
            console.log("user email is");
            console.log(user.email);
            axios.post(`${API_ENDPOINT}/api/register`, { email });
            console.log(user);
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <div className="p-4">
      <h1 className="px-4 mb-4 text-2xl">Please login to continue</h1>
      <form onSubmit={login}>
        <div className="container flex flex-col p-4 md:max-w-xl">
          <label className="block mb-4">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              className="block w-full mt-1 form-input"
              placeholder="faraz@codalyze.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-700">Password</span>
            <input
              type="password"
              className="block w-full mt-1 form-input"
              placeholder="*********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div className="flex w-full space-x-4 ">
            <button
              type="submit"
              className="flex items-center justify-between px-4 py-2 text-white bg-gray-800 rounded shadow"
            >
              Submit
            </button>

            <button
              className="flex items-center px-8 py-4 space-x-4 text-white bg-white rounded shadow "
              type="button"
              onClick={authGoogle}
            >
              <svg
                height="16"
                viewBox="0 0 1792 1792"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path d="M896 786h725q12 67 12 128 0 217-91 387.5t-259.5 266.5-386.5 96q-157 0-299-60.5t-245-163.5-163.5-245-60.5-299 60.5-299 163.5-245 245-163.5 299-60.5q300 0 515 201l-209 201q-123-119-306-119-129 0-238.5 65t-173.5 176.5-64 243.5 64 243.5 173.5 176.5 238.5 65q87 0 160-24t120-60 82-82 51.5-87 22.5-78h-436v-264z" />
              </svg>
              <span className="text-black">Login with Google</span>
            </button>
          </div>
        </div>
      </form>
      <p className="px-4">
        Need an account?
        <Link to="/register">
          <span className="font-bold text-blue-600 cursor-pointer">
            {" "}
            Sign up here
          </span>
        </Link>
      </p>
    </div>
  );
};

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const Auth = useContext(AuthContext);
  const history = useHistory();

  const register = (e) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
          firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then((res) => {
              if (res) {
                Auth.setIsLoggedIn(true);
                axios.post(`${API_ENDPOINT}/api/register`, { email });
                history.push("/");
              }
            })
            .catch((e) => {
              console.log(e);
            });
        });
    } else alert("Validation Error");
  };

  const authGoogle = (e) => {
    e.preventDefault();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        Auth.setIsLoggedIn(true);

        history.push("/");

        // This gives you a Google Access Token.
        const token = result.credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        axios.post(`${API_ENDPOINT}/api/register`, { email: user.email });
        console.log(user);
      })
      .catch((e) => console.log(e));
  };

  return (
    <div className="p-4">
      <h1 className="px-4 mb-4 text-2xl">Register a new account</h1>
      <form onSubmit={register}>
        <div className="container flex flex-col p-4 md:max-w-xl">
          <label className="block mb-4">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              className="block w-full mt-1 form-input"
              placeholder="faraz@codalyze.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-700">Password</span>
            <input
              type="password"
              className="block w-full mt-1 form-input"
              placeholder="*********"
              value={password}
              minlength="8"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className="flex w-full space-x-4 ">
            <button className="flex items-center justify-between px-4 py-2 text-white bg-gray-800 rounded shadow">
              Register
            </button>

            <button
              className="flex items-center px-8 py-4 space-x-4 text-white bg-white rounded shadow "
              type="button"
              onClick={authGoogle}
            >
              <svg
                height={16}
                viewBox="0 0 1792 1792"
                width={16}
                className="text-white"
              >
                <path d="M896 786h725q12 67 12 128 0 217-91 387.5T1282.5 1568 896 1664q-157 0-299-60.5T352 1440t-163.5-245T128 896t60.5-299T352 352t245-163.5T896 128q300 0 515 201l-209 201q-123-119-306-119-129 0-238.5 65T484 652.5 420 896t64 243.5T657.5 1316t238.5 65q87 0 160-24t120-60 82-82 51.5-87 22.5-78H896V786z" />
              </svg>
              <span className="text-black">Register with Google</span>
            </button>
          </div>
        </div>
      </form>
      <p className="px-4">
        Have an account?
        <Link to="/login">
          <span className="font-bold text-blue-600 cursor-pointer">
            {" "}
            Login here
          </span>
        </Link>
      </p>
    </div>
  );
};

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const Auth = useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={(props) => {
        if (Auth.isLoggedIn) {
          return <Component {...rest} {...props} />;
        } else
          return (
            <Redirect
              to={{ pathname: "/login", state: { from: props.location } }}
            />
          );
      }}
    />
  );
};

export default App;
