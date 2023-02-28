/*
 *   Copyright (c) 2021 B.P.S.
 *   All rights reserved.
 *    *   Unauthorized copying of this file, via any medium is strictly prohibited\n *   Proprietary and confidential
 */
const amqplib = require('amqplib');
const express = require('express');
require("dotenv").config();
const winston = require('winston');
var morgan = require('morgan')
const http = require('http');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

require('./config/logging')();
require('./config/db')


const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'))

const routes = require('./routes/routes')
app.use(routes);

const httpPort = process.env.PORT_HTTP || 3050;
const httpsPort = process.env.PORT_HTTPS || 3555;

var httpServer = http.createServer(app);

httpServer.listen(httpPort, () => {
  console.log("Http server listening on port : " + httpPort || httpsPort)
});