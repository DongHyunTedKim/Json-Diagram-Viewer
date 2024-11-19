import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(compression());
app.use(express.static('dist'));
app.get('*', (_, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));

app.listen(3000, () => {
  console.log('HTTP 서버 실행 중: http://localhost:3000');
});