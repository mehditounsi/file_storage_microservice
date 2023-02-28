/*
 *   Copyright (c) 2021 B.P.S.
 *   All rights reserved.
 *    *   Unauthorized copying of this file, via any medium is strictly prohibited\n *   Proprietary and confidential
 */
const mongoose = require('mongoose')

const port = "27017"
const dbname = "storage"
const dbserver = "localhost"



mongoose.connect(process.env.DATABASE_CONNECTIONSTRING || `mongodb://${dbserver}:${port}/${dbname}`, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(r => console.log(`Connected to mongodb db ${dbname} on ${dbserver}:${port}`))

    .catch(e => console.error("Fatal : Not connected to mongoDB"))