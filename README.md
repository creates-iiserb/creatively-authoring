Installation 

- run `npm install` to install required node modules 
- Download and install the following dependentcies and place them inside `public/author_public` folder
    - [Paper dashboard pro](https://www.creative-tim.com/product/paper-dashboard-pro) (create a new folder named `PaperDashBoard`)
    - [C K Editor 4](https://ckeditor.com) (create a new folder `ckeditor`)
- Create a `configEnv.json` file which contains the following fields - 
```
{
    "couchdb": "couchdb url with username and password",
    "cradle": "couchdb url ",
    "cradle_port": "couch db url port",
    "auth": "couchdb username: password ",
    "req_url": "backend url",
    "quiz_url": "quiz frontend url",
    "httpFlag": true,
    "secureFlag": false,
    "logPath": "log file path",
    "socketUrl": "realtime socket url"
}
```
- To start the server,run `npm start` or `node app.js`