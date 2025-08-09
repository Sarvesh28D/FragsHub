const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/test', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
