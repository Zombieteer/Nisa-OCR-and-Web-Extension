import React, { useContext } from "react";
import { Link, NavLink, useHistory } from "react-router-dom";

const Layout = ({
  AuthContext,
  isLoggedIn,
  setIsLoggedIn,
  firebase,
  isOpen,
  setIsOpen,
}) => {
  const history = useHistory();
  const Auth = useContext(AuthContext);
  return (
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
              {Auth.isAdmin && (
                <li className="pb-2 md:mx-3 md:py-6">
                  <NavLink
                    className="text-gray-900 hover:text-gray-700 focus:text-gray-700"
                    to="/admin-panel"
                  >
                    Admin Panel
                  </NavLink>
                </li>
              )}

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
                          localStorage.removeItem("isAdmin");
                          history.push("/login");
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
  );
};

export default Layout;
