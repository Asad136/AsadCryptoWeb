const express = require('express');
const dbConnect = require("./database/index");
const { PORTS } = require('./config/index');
const router = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser()); // Use cookie-parser middleware first
app.use(express.json());
app.use(router);
app.use(errorHandler);
app.use('/Storage',express.static('Storage'));

dbConnect();
app.get('/', (req, res) => res.json({ msg: "hello123" }));

app.listen(PORTS, () => console.log(`Server is running on port ${PORTS}`));
