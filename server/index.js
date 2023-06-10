const express = require("express");
var session = require('express-session')
const cors = require('cors');
const fs = require('fs');
const proxy = require('express-http-proxy');



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

// Gets the code from the client and makes a request to Finch to get access_token
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

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});