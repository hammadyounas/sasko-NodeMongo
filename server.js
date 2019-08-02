
require('dotenv').config()
const router = require('./routes/index.routes');
const app = require('./init')();

app.use(process.env.API_ENDPOINT || '/', router);