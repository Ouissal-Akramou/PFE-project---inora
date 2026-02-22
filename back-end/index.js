import express from 'express';
import cors from 'cors';
import auth from './Routes/auth.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.use('/auth', auth);

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});