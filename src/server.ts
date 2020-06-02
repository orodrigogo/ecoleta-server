import express from 'express';
import cors from 'cors';
import routes from './routes';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

// Para acessar as imagens diretamente.
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))


app.listen(3333);