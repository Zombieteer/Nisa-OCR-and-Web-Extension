import React, { Fragment } from "react";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import RegisteredUser from "./RegisteredUser";
import Settings from "./Settings";

const AdminPanel = () => {
  let { path, url } = useRouteMatch();
  return (
    <Fragment>
      <div className="flex">
        <aside className="w-1/8 pr-4 border-r border-grey-light min-h-screen">
          <div className="pb-5 font-bold mt-5">
            <h2 className="text-2xl">Admin Panel</h2>
          </div>
          <nav>
            <ul className="list-reset">
              <li className="mb-4 text-gray-900 hover:text-gray-700 focus:text-gray-700">
                <Link to={`${url}`}>Registered Users</Link>
              </li>
              <li className="mb-4 text-gray-900 hover:text-gray-700 focus:text-gray-700">
                <Link to={`${url}/settings`}>Settings</Link>
              </li>
            </ul>
          </nav>
        </aside>
        <Switch>
          <Route exact path={path}>
            <RegisteredUser />
          </Route>
          <Route path={`${path}/settings`}>
            <Settings />
          </Route>
        </Switch>
      </div>
    </Fragment>
  );
};

export default AdminPanel;
