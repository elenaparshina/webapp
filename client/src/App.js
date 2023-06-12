import logo from './logo.svg';
import './App.css';
import React , {useState, useEffect} from "react";
import { useFinchConnect } from '@tryfinch/react-connect';
import Select from 'react-select';

async function get_token(provider) {
  console.log(`get_token, option selected:`, provider);
    let response = await fetch(`http://localhost:3000/set_env?provider=${provider}`, {
      method: 'get'
    })
    let response_status = response.status;
    return response_status;
}

async function get_directory() {
  console.log('get_directory')
  let response = await fetch(`http://localhost:3000/get_dir`, {
    method: 'get'
  })
  let response_json = await response.json();
  return response_json;
}

async function get_company() {
  console.log('get_company')
  let response = await fetch(`http://localhost:3000/get_comp`, {
    method: 'get'
  })
  if (response.status == 200) {
    let response_json = await response.json();
    return response_json;
  } else if (response.status == 501) {
    return `error: provider doesn't implement /company endpoint`
  }
}

async function get_individual(id) {
  console.log('get_individual')
  let response = await fetch(`http://localhost:3000/get_individual?id=${id}`,{
    method:'get'
  });
  let response_json = await response.json();
  return response_json;
}

async function get_employment(id) {
  console.log('get_employment')
  let response = await fetch(`http://localhost:3000/get_employment?id=${id}`,{
    method:'get'
  });
  let response_json = await response.json();
  return response_json;
}

function App() {
  const providers = [
    { value: 'gusto', label: 'Gusto' },
    { value: 'workday', label: 'Workday' },
    { value: 'bamboohr', label: 'BambooHR' },
    { value: 'paychex_flex', label: 'Paychex Flex' },
    { value: 'justworks', label: 'Justworks' }
  ]
  
  const [dir_data, set_dir] = useState(null);
  const [comp_data, set_comp] = useState(null);
  const [ind_data, set_ind] = useState(null);
  const [emp_data, set_emp] = useState(null);
  const [clicked_id, set_id] = useState(null);
  const [provider, set_provider] = useState(null)

  
  async function provider_change(selectedOption) {
    console.log(`Option selected: `, selectedOption);
    let token = await get_token(selectedOption.value);
    let directory = await get_directory();
    let company = await get_company(selectedOption.value);
    
    set_dir(directory.individuals);
    set_comp(company);
    set_provider(selectedOption.value)
  };

  async function onRowClick(clicked_id) {
    set_id(clicked_id)
    let individual = await get_individual(clicked_id);
    let employee = await get_employment(clicked_id);
    set_ind(individual)
    set_emp(employee)
  };
 

  function EmployeeTable({data}) {
    if (data == null) {
      return <p>Select provider and click employee record</p>;
    } else {
      const table_body = Object.entries(data).map(entry => {
        return  (
        <tr key={entry[0]}>
          <td>{entry[0]}</td>
          <td> {render_value(entry[1])} </td> 
        </tr>  
        )  
      });
      return (
        <table>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th> 
            </tr>  
          </thead> 
          <tbody>{table_body}</tbody>
          </table>            
        )
    }
  }


  function DirTable({data, onClickHandler, selected }) {
    if (data === null ) {
      return <p>Select provider to see directory data</p>;
    } else {
      const table_body = data.map(item => {
        return (
          <tr key={item.id} onClick={async () => await onClickHandler(item.id) } className={ selected == item.id ? 'highlight' : 'no_highlight'}>
            <td>{item.id}</td>
            <td>{item.first_name}</td>
            <td>{item.last_name}</td>
            <td>{item.middle_name}</td>
            <td>{item.department.name}</td>
            <td>{item.manager == null ? 'n/a' : item.manager.id }</td>
            <td>{item.is_active == null ? 'n/a' : item.is_active }</td>
          </tr>
        )
      })
      return (
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Middle Name</th>
              <th>Department</th>
              <th>Manager</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>{table_body}</tbody>      
        </table>
      )
    }
  }

  function CompanyTable({data,provider}) {
    if (data == 'error: provider doesn\'t implement /company endpoint') {
      return <p style={{color:'red'}}> Provider {provider} doesn't implement /company endpoint</p>;
    } else if (data == null ) {
      return <p> Select provider to see company data</p>;
    } else {
      return (
        <table>
          <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
          </tr>
         </thead> 
          <tbody>
            <tr> 
              <td> id </td>
              <td> {data.id} </td>
            </tr>
            <tr> 
              <td> Legal name </td>
              <td> {data.legal_name} </td>
            </tr>
            <tr> 
              <td> EIN </td>
              <td> {data.ein} </td>
            </tr>
            <tr> 
              <td> Entity type </td>
              <td> {data.entity.type} </td>
            </tr>
            <tr> 
              <td> Primary email </td>
              <td> {data.primary_email} </td>
            </tr>
            <tr> 
              <td> Primary phone number </td>
              <td> {data.primary_phone_number} </td>
            </tr>
            <tr> 
              <td> Locations # </td>
              <td> {data.locations.length} </td>
            </tr>
            <tr> 
              <td> Locations </td>
              <td> {render_value(data.locations)} </td>
            </tr>
            <tr> 
              <td> Accounts # </td>
              <td> {data.accounts.length} </td>
            </tr>
            <tr> 
              <td> Accounts </td>
              <td> {render_value(data.accounts)} </td>
            </tr>
          </tbody>
        </table>
      )
    }
  }
  
  function render_value(obj) {
    let arr = []
    let loc_num = 1;
    let res = '';

    if (obj === null ) {
      res = 'n/a';
    } 
    if ( typeof(obj) == 'boolean') {
      res = String(obj)
    }
    if ( obj instanceof Date) {
      res = String(obj)
    }
    if ( typeof(obj) == 'string') {
      if (obj == null) {
        res = 'n/a'
      } else {
        res = obj;
      }
     
    } else if ((obj instanceof Object) && !(obj instanceof Array)) {
      for (const [key, value] of Object.entries(obj)) {
        arr.push(`${key}:${value}`);
      }
      res = (`${res} ${arr.join(', ')}`)
      
    } else if ((obj instanceof Object) && (obj instanceof Array)) {
        if (obj.length == 0) {
          res = 'n/a';
        }
        for (const item of obj) {
          arr = [];
            for (const [key, value] of Object.entries(item)) {
              arr.push(`${key}:${value}`);
              
            }    
          res = (`${res} #${loc_num}: ${arr.join(', ')}`)
          loc_num++;   
        }
      }
    return res;
  }
  /*
  const MyComponent = () => (
    <Select options={options} />
  )
  */
  /*
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
  
  */



  return (
    <div>
      <header>
        <p>Select a provider:</p>
        <Select options={providers} onChange={provider_change} autoFocus={true} />

      </header>
      <div>
        <h2>Directory</h2>
          <div><DirTable data={dir_data} onClickHandler={onRowClick} selected={clicked_id}/></div>

        <h3>Employee: personal</h3>
          <div><EmployeeTable data={ind_data} /></div>
          
        <h3>Employee: employment</h3>
          <div><EmployeeTable data={emp_data} /> </div>
            
        <h2>Company</h2>
            <div ><CompanyTable data={comp_data} provider={provider}/></div>
        </div>
      
    </div>
  );
};

export default App;