const http = require('http');

const PORT = process.env.PORT || 3000;
const registry = process.env.CONTAINER_REGISTRY || 'Not defined';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Container registry: ${registry}\n`);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
