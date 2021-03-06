import express from 'express';
import cookieParser from 'cookie-parser';

import CONFIG from '../../../config';
import authMiddleware from '../../middlewares/Auth';
import * as gAuth from '../../modules/GoogleAuth';
import path from 'path';

const ENV = process.env.NODE_ENV || 'dev';

let app = express();

app.set('port', CONFIG.PORT);
console.log("MY PORT IS ", CONFIG.PORT);
app.listen(app.get('port'));
app.use(cookieParser());
app.use('/rest/', authMiddleware);

let bodyParser = require('body-parser');
app.use( bodyParser.json() );
// app.use(express.json());



if (ENV === 'dev') {
  let webpack = require("webpack")
  let webpackMiddleware = require('webpack-dev-middleware');
    app.use(webpackMiddleware(webpack(require('../../../webpack.config')), {
        publicPath: "/assets/",
    }));
}

app.get("/", async (req, res)=>{

    if(req.cookies['g_id_token'] && await gAuth.checkForAuthorization(req.cookies['g_id_token'])){
        console.log("Auth token exists, serving index");
        res.sendFile(path.join(__dirname + '/../../../public/index.html'))
    }
    else {
        console.log("NO auth token, serving login");
        res.sendFile(path.join(__dirname + '/../../../public/login.html'))
    }
});

app.get("/index.html", (req,res)=>{
    res.status('404').send("not available");
});

app.use(express.static('public'));


export default app;