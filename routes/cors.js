const express = require('express');
const cors = require('cors');
const app = express();


// App ID - 3240097842919840
// App-Secret - 23c2ec85c06ebae9e3f0c06ea56dbb90
// accessToken - "EAAuC2hD2ZBaABAI0Im1guNPecrC5v2zT1IYwOTq6tHNCo87MoASnVPhVvXnDErdlVLRA9PQwn5xnQdwsGjzixCeCNO1toLU07PkDpblZChkbRBss3Pdf8XCBapcj8hugzTGYrI9OYoyuu9VVVLeZBrDx9EDxUYMRfZB31WTqDPCnvnZAT5xJp"

const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://DESKTOP-HFDE3RP:3001'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log(req.header('Origin')); // Current Url
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors(); // standard route
exports.corsWithOptions = cors(corsOptionsDelegate); // for specific route