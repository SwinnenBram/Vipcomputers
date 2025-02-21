import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Admin from './Admin';
import PCBuilder from './PCBuilder';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/admin" component={Admin} />
          <Route path="/builder" component={PCBuilder} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
