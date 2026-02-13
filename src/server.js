require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`HRIS Backend running at http://localhost:${PORT}`);
  console.log(`Swagger UI (REST API guide): http://localhost:${PORT}/api-docs`);
});
