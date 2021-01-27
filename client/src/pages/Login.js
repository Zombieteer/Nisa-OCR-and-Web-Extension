import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";

const Login = ({ firebase, API_ENDPOINT, AuthContext }) => {
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
            // This gives you a Google Access Token.
            const token = result.credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            axios
              .post(`${API_ENDPOINT}/api/register`, {
                email: user.email,
                name: user.displayName,
              })
              .then((res) => {
                if (res.data.status === "success") {
                  Auth.setIsLoggedIn(true);
                  if (res.data.isAdmin === "admin") {
                    Auth.setIsAdmin(true);
                    localStorage.setItem("isAdmin", true);
                  }
                  history.push("/");
                }
              });
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
export default Login;
