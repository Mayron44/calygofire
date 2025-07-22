import { Switch, Route, useLocation } from "wouter";

function DebugRouter() {
  const [location] = useLocation();
  
  console.log("🔍 Current location:", location);
  console.log("🔍 Routes configured:", ["/", "/login", "/register", "/dashboard", "/map", "/sales", "/users", "/tournees"]);
  
  return (
    <div>
      <h1>Debug Router</h1>
      <p>Current location: {location}</p>
      <Switch>
        <Route path="/">
          <div>Home Page</div>
        </Route>
        <Route path="/login">
          <div>Login Page</div>
        </Route>
        <Route path="/dashboard">
          <div>Dashboard Page</div>
        </Route>
        <Route path="/tournees">
          <div>Tournees Page Works!</div>
        </Route>
        <Route>
          <div>404 - Not Found (location: {location})</div>
        </Route>
      </Switch>
    </div>
  );
}

export default DebugRouter;