const express = require('express');
const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
const TEMPLATES_DIR = path.join(__dirname, 'src', 'Templates');

nunjucks.configure(TEMPLATES_DIR, { autoescape: false, express: app });

app.use(bodyParser.json());

// Endpoint pour lister les templates HTML, TXT, JSON
app.get('/api/templates', (req, res) => {
  const files = fs.readdirSync(TEMPLATES_DIR)
    .filter(f => f.endsWith('.html') || f.endsWith('.txt') || f.endsWith('.json'));
  res.json(files);
});

// Endpoint pour générer le rendu d'un template avec des données
app.post('/api/render', (req, res) => {
  const { template, data } = req.body;
  nunjucks.render(template, data, (err, result) => {
    if (err) {
      console.error('Nunjucks render error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.send(result);
  });
});

app.listen(5174, () => {
  console.log('Backend running on http://localhost:5174');
}); 