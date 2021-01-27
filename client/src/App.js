import React, { useState, useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import firebase from "firebase";
import firebaseConfig from "./firebase.config.js";

import AdminPanel from "./admin/AdminPanel.js";
import Home from "./pages/Home.js";
import Encrypt from "./pages/Encrypt.js";
import Decrypt from "./pages/Decrypt.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Layout from "./components/Layout.js";

firebase.initializeApp(firebaseConfig);

export const AuthContext = React.createContext(null);

const API_ENDPOINT =
  process.env.REACT_APP_API_ENDPOINT || `http://localhost:3001`;

function App() {
  const [isOpen, setIsOpen] = useState(false);
  // is true on every load so commented for now
  // const [isLoggedIn, setIsLoggedIn] = useState(
  //   firebase.auth.Auth.Persistence.LOCAL
  // );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  console.log("Current user");
  console.log(firebase.auth().currentUser);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        setIsLoggedIn(true);
        localStorage.setItem("authUser", JSON.stringify(authUser));
        localStorage.getItem("isAdmin") &&
          setIsAdmin(localStorage.getItem("isAdmin"));
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem("authUser");
        setIsAdmin(false);
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
      <AuthContext.Provider
        value={{ isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin }}
      >
        <Router>
          <Layout
            AuthContext={AuthContext}
            isLoggedIn={isLoggedIn}
            firebase={firebase}
            setIsLoggedIn={setIsLoggedIn}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
          <div className="container mx-auto">
            <Switch>
              <Route path="/" exact>
                <Home />
              </Route>

              <ProtectedRoute
                exact
                path="/admin-panel"
                component={() => <AdminPanel API_ENDPOINT={API_ENDPOINT} />}
              />
              <Route path="/admin-panel">
                <AdminPanel />
              </Route>

              <ProtectedRoute exact path="/encrypt" component={Encrypt} />

              <Route path="/encrypt" exact>
                <Encrypt API_ENDPOINT={API_ENDPOINT} />
              </Route>
              <Route path="/verify" exact>
                <Decrypt API_ENDPOINT={API_ENDPOINT} />
              </Route>

              <Route path="/login" exact>
                <Login
                  firebase={firebase}
                  API_ENDPOINT={API_ENDPOINT}
                  AuthContext={AuthContext}
                />
              </Route>

              <Route path="/register" exact>
                <Register
                  firebase={firebase}
                  API_ENDPOINT={API_ENDPOINT}
                  AuthContext={AuthContext}
                />
              </Route>
            </Switch>
          </div>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

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
