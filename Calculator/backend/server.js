const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

// DB
mongoose
  .connect(process.env.MONGO_URI, { dbName: 'calc_app' })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error', err.message);
    process.exit(1);
  });

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/calculations', require('./routes/calculations'));

app.listen(PORT, () => console.log(`Server running on :${PORT}`));