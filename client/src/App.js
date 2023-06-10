import logo from './logo.svg';
import './App.css';
import React , {useState, useEffect} from "react";
import { useFinchConnect } from '@tryfinch/react-connect';

const App = () => {
  const [code, setCode] = useState(null);
  // require('react-dom');
  // window.React2 = require('react');
  // console.log(window.React1 === window.React2);

  // let onSuccess = ({ code }) => setCode(code);
  let onSuccess = ({ code }) => {
    console.log(code);
    // Sends the code to the server
    fetch(`http://localhost:3000/token_exchange?code=${code}`, {
      method: 'GET'
    })
    .then((_) => {
      fetch('http://localhost:3000/company', {
        method: 'get'
      })
    })
    .then(response => {
      return response.json()
    })
  }  

  const onError = ({ errorMessage }) => console.error(errorMessage);
  const onClose = () => console.log('User exited Finch Connect');

  const { open } = useFinchConnect({
    clientId: 'bea584e8-b962-4396-a643-8a2983dca5ec',
    // The below are only a few of Finch's product scopes, please check Finch's [documentation](https://developer.tryfinch.com/docs/reference/ZG9jOjMxOTg1NTI3-permissions) for the full list
    products: ['company', 'directory'],
    // Check Finch's [documentation](https://developer.tryfinch.com/docs/reference/96f5be9e0ec1a-providers) for the full list of payroll provider IDs
    // payrollProvider: '<payroll-provider-id>',
    // sandbox: false,
    // manual: false,
    // zIndex: 999,
    onSuccess,
    onError,
    onClose,
    sandbox: true
  });
  
  
  


  return (
    <div>
      <header>
        <p>Code: {code}</p>
        <button type="button" onClick={() => open()}>
          Open Finch Connect
        </button>
      </header>
    </div>
  );
};

export default App;