const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <div style="text-align: center; margin-top: 50px; font-family: Arial;">
      <h1>🚀 Dockerized Node.js Application 🚀</h1>
      <p>App running successfully inside a Docker container!</p>
      <p><strong>Port:</strong> ${PORT}</p>
    </div>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
