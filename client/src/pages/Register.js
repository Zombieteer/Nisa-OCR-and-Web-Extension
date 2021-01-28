import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";

const Register = ({ firebase, API_ENDPOINT, AuthContext }) => {
  const [name, setName] = useState("");
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
                axios
                  .post(`${API_ENDPOINT}/api/register`, { email, name })
                  .then((res) => {
                    console.log(res);
                    if (res.data.status === "success") {
                      Auth.setIsLoggedIn(true);
                      history.push("/");
                    }
                  });
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
              history.push("/");
            }
          });
      })
      .catch((e) => console.log(e));
  };

  return (
    <div className="p-4">
      <h1 className="px-4 mb-4 text-2xl">Register a new account</h1>
      <form onSubmit={register}>
        <div className="container flex flex-col p-4 md:max-w-xl">
          <label className="block mb-4">
            <span className="text-gray-700">Name</span>
            <input
              type="text"
              className="block w-full mt-1 form-input"
              placeholder="faraz"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

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

export default Register;
