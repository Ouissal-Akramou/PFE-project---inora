import express from 'express';
const app = express();
import auth from './Routes/auth.js';
import cookieParser from 'cookie-parser';

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello world')
})

app.use('/auth', auth);

app.listen(4000, () => {
    console.log('Server is running on port 4000');
})