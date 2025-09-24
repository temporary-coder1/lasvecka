const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

const allowedOrigins = ['http://localhost:3333'];

const corsOptions = {
    origin: function (origin, callback) {        
        callback(null, true);
    }
};

// Use CORS with options
app.use(cors(corsOptions));
app.use(express.json());

app.get('/lasvecka', async (req, res) => {
    console.log("Connect");
    const response = await fetch("https://lasvecka.nu/data", {
        headers: {
            "Content-Type": "application/json"
        }
    });
    console.log('Response status:', response);
    const data = await response.text()
    console.log('Data fetched:', data);
    res.send(data);
});

if (process.env.NODE_ENV !== 'production') {
    const PORT = 3333;
    app.listen(PORT, () => {
        console.log(`Server is running locally on http://localhost:${PORT}`);
    });
}

module.exports = app;

