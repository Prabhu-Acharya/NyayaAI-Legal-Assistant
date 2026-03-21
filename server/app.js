const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const queryRoutes = require('./routes/queryRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// routes AFTER middleware
app.use('/api/users', userRoutes);
app.use('/api/query', queryRoutes);

app.get('/', (req, res) => {
    res.send('NyayaAI API Running 🚀');
});

module.exports = app;