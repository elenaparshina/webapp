const express = require("express");
var session = require('express-session')
const cors = require('cors');
const fs = require('fs');


const PORT = process.env.PORT || 3001;

const app = express();

// Allow requests from a different origin
app.use(cors())


// Set session Id 
app.use(session({ 
    secret: 'keyboard cat', 
    cookie: { 
        maxAge: 86400000 
    },
    resave: false,
    saveUninitialized: true
}))

/*
    fetch('https://finch-sandbox-se-interview.vercel.app/api/sandbox/create', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({
        'provider': selected_provider,
        'products': ['company', 'directory', 'individual', 'employment']
      })
    })
*/
app.get('/set_env', async (req, res) => {
    console.log(`Session Id:  ${req.session.id}, selected provider: ${req.query.provider}` );
    const selected_provider = req.query.provider;
    let response = await fetch('https://finch-sandbox-se-interview.vercel.app/api/sandbox/create', {
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
        body: JSON.stringify(
            {
                'provider': selected_provider,
                'products': ['company', 'directory', 'individual', 'employment']
            }
        )
    });
    let response_json = await response.json();
    let access_token = response_json.access_token;
    
   //  console.log(JSON.stringify(response_json))
    fs.writeFileSync(`./tokens/${req.session.id}`, access_token);
    //res.json(response_json);
    if (response.status == '200') {
        res.status(200).send()
    } else {
        res.send('error')
    }
})

app.get('/get_dir', async (req, res) => {
    console.log('get dir');
    let token = fs.readFileSync(`./tokens/${req.session.id}`);
    console.log('token: ' + token);
    let response = await fetch('https://finch-sandbox-se-interview.vercel.app/api/employer/directory', {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        method: 'get'
    });
    let response_json = await response.json();
    res.status(response.status).json(response_json);
})

app.get('/get_comp', async (req, res) => {
    console.log('get comp');
    let token = fs.readFileSync(`./tokens/${req.session.id}`);
    console.log('token: ' + token);
    let response = await fetch('https://finch-sandbox-se-interview.vercel.app/api/employer/company', {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        method: 'get'
    });    
    let response_json = await response.json();
    res.status(response.status).json(response_json);  
});

app.get('/get_individual', async (req, res) => {
    console.log('get individual');
    let token = fs.readFileSync(`./tokens/${req.session.id}`);
    console.log('token: ' + token);
    let id = req.query.id;
    let response = await fetch('https://finch-sandbox-se-interview.vercel.app/api/employer/individual', {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        method: 'post',
        body: JSON.stringify(
            {
                "requests": [
                    {
                        "individual_id": id
                    }
                ]
            }
        )
    });   
    console.log(response.status)
    let response_json = await response.json();
    // console.log(JSON.stringify(response_json.responses[0].body)) 

    res.status(response.status).json(response_json.responses[0].body);  
})

app.get('/get_employment', async (req, res) => {
    console.log('get employment');
    let token = fs.readFileSync(`./tokens/${req.session.id}`);
    console.log('token: ' + token);
    let id = req.query.id;
    let response = await fetch('https://finch-sandbox-se-interview.vercel.app/api/employer/employment', {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        method: 'post',
        body: JSON.stringify(
            {
                "requests": [
                    {
                        "individual_id": id
                    }
                ]
            }
        )
    });   
    console.log(response.status)
    let response_json = await response.json();
    // console.log(JSON.stringify(response_json.responses[0].body)) 

    res.status(response.status).json(response_json.responses[0].body);  
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });


















// Gets the code from the client and makes a request to Finch to get access_token
// ===============================================================
app.get("/token_exchange", async (req, res) => {
    console.log('id ' + req.session.id)
    
    const code_val = req.query.code;
    console.log('code_val ' + code_val )
    
    let response = await fetch('https://api.tryfinch.com/auth/token', {
        method: 'post',
        body: JSON.stringify({
            "client_id": "bea584e8-b962-4396-a643-8a2983dca5ec",
            "client_secret": "finch-secret-sandbox-IGrWkWR1zQ4JXebJ6s6C9hdM3jHk0LI-qMUMHCEV",
            "code": code_val,
            "redirect_uri": "https://tryfinch.com"
        }),
        headers: {'Content-Type': 'application/json'},
    })
    console.log(response.status)

    let json  = await response.json();
    console.log(JSON.stringify(json))
    fs.writeFileSync(`./${req.session.id}`, json.access_token);

    res.send('got the token')
    return   
  });

app.get("/company", async (req, res) => {
    //read the token
    console.log('/company handler')
    console.log('session id ' + req.session.id)
    let token = fs.readFileSync(`./${req.session.id}`);
    console.log('token ' + token)
    let response = await fetch('https://finch-sandbox-se-interview.vercel.app/employer/company', {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'Finch-API-Version': '2020-09-17',
            'Authorization': `Bearer ${token}`
        }
    })
    let company_json = await response.json();
    console.log(JSON.stringify(company_json))
    res.send(JSON.stringify(company_json));
})

