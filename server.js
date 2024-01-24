const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser'); // for parsing JSON requests

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const cors = require('cors')

const app = express();
const port = 4000; // Change this to your desired port

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Connect to your SQLite database
const db = new sqlite3.Database('./database/montresDB.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database');
  }
});

// Define the API endpoints
// Redirect the home to all montres
app.get('/', (req, res) => {
    res.redirect('/montres');
});

// Define a route for help and contact
app.get('/help-contact', (req, res) => {
    // The HTML file will be served automatically from the 'public' directory
    res.sendFile(__dirname + '/help-contact.html');
});

// ----------------------------------------

// ----- CONNEXION / INSCRIPTION -----

app.post('/inscription', (req, res) => {
  const { NomUser, MotDePasse } = req.body;

  const hashMotDePasse = bcrypt.hashSync(MotDePasse, 10);

  const query = 'INSERT INTO Utilisateurs (NomUser, MotDePasse) VALUES (?, ?)';
  db.run(query, [NomUser, hashMotDePasse], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ UserID: this.lastID });
  });
});

app.post('/connexion', (req, res) => {
  const { NomUser, MotDePasse } = req.body;

  const query = `SELECT * FROM Utilisateurs WHERE NomUser = ?`;
  db.get(query, [NomUser], (err, Utilisateur) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!Utilisateur || !bcrypt.compareSync(MotDePasse, Utilisateur.MotDePasse)) {
      return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }

    // Créer un token JWT
    const token = jwt.sign({ UserID: Utilisateur.UserID }, 'token', { expiresIn: '1h' });

    res.json({ token, UserID: Utilisateur.UserID });
  });
});



// Middleware pour vérifier le token sur les requêtes protégées
function verifierToken(req, res, next) {
  const token = req.header('Authorization');
  console.log(token);

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé' });
  }

  jwt.verify(token, 'token', (err, decoded) => {
    if (err) {
      console.error('Erreur lors de la vérification du token:', err);
      return res.status(401).json({ error: 'Token non valide' });
    }

    const { UserID } = decoded;

    if (!UserID) {
      return res.status(401).json({ error: 'Token ne contient pas l\'UserID' });
    }

    console.log('Token valide pour l\'UserID:', UserID);

    req.UserID = decoded.UserID;
    next();
  });
}

// -------------- LISTE MONTRE ------------------

// Afficher toutes les montres
app.get('/montres', (req, res) => {
  const query = `
    SELECT 
      M.MontreID,
      M.NomMontre,
      U.NomUser,
      B.NomBoitier,
      TB.NomTexture AS TextureBoitier,
      P.NomPierre,
      TBra.NomTexture AS TextureBracelet,
      
      B.Prix AS PrixBoitier,
      TB.Prix AS PrixTextureBoitier,
      P.Prix AS PrixPierre,
      TBra.Prix AS PrixTextureBracelet,
      (B.Prix + TB.Prix + P.Prix + TBra.Prix) AS PrixTotal

    FROM Montres AS M
    LEFT JOIN Utilisateurs AS U ON M.UserID = U.UserID
    LEFT JOIN Boitier AS B ON M.BoitierID = B.BoitierID
    LEFT JOIN TextureBoitier AS TB ON M.TextureBoitierID = TB.TextureBoitierID
    LEFT JOIN Pierres AS P ON M.PierreID = P.PierreID
    LEFT JOIN TextureBracelet AS TBra ON M.TextureBraceletID = TBra.TextureBraceletID
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).json({ error: 'Internal server error' });
      return
    } else {
      res.json(rows);
    }
  });
});

// Route pour retourner la liste des montres configurées par un utilisateur
app.get('/montresConfiguredByUser', verifierToken, (req, res) => {
  const UserID = req.UserID;

  const query = `
    SELECT 
      M.MontreID,
      M.NomMontre,
      B.NomBoitier,
      TB.NomTexture AS TextureBoitier,
      P.NomPierre,
      TBra.NomTexture AS TextureBracelet,
      B.Prix AS PrixBoitier,
      TB.Prix AS PrixTextureBoitier,
      P.Prix AS PrixPierre,
      TBra.Prix AS PrixTextureBracelet,
      (B.Prix + TB.Prix + P.Prix + TBra.Prix) AS PrixTotal

    FROM Montres AS M
    LEFT JOIN Boitier AS B ON M.BoitierID = B.BoitierID
    LEFT JOIN TextureBoitier AS TB ON M.TextureBoitierID = TB.TextureBoitierID
    LEFT JOIN Pierres AS P ON M.PierreID = P.PierreID
    LEFT JOIN TextureBracelet AS TBra ON M.TextureBraceletID = TBra.TextureBraceletID
    WHERE M.UserID = ?
  `;

  try {
    db.all(query, [UserID], (err, rows) => {
      if (err) {
        console.error('Error executing query:', err.message);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(rows);
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des montres configurées:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des montres configurées' });
  }
});


// Afficher une montre de la liste
app.get('/montre/:MontreID', (req, res) => {
  const { MontreID } = req.params;
  
  const query = `
    SELECT 
      M.MontreID,
      M.NomMontre,
      B.BoitierID,
      B.NomBoitier,
      TB.TextureBoitierID,
      TB.NomTexture AS TextureBoitier,
      P.PierreID,
      P.NomPierre,
      TBra.TextureBraceletID,
      TBra.NomTexture AS TextureBracelet,
      
      B.Prix AS PrixBoitier,
      TB.Prix AS PrixTextureBoitier,
      P.Prix AS PrixPierre,
      TBra.Prix AS PrixTextureBracelet,
      (B.Prix + TB.Prix + P.Prix + TBra.Prix) AS PrixTotal

    FROM Montres AS M
    LEFT JOIN Boitier AS B ON M.BoitierID = B.BoitierID
    LEFT JOIN TextureBoitier AS TB ON M.TextureBoitierID = TB.TextureBoitierID
    LEFT JOIN Pierres AS P ON M.PierreID = P.PierreID
    LEFT JOIN TextureBracelet AS TBra ON M.TextureBraceletID = TBra.TextureBraceletID
    WHERE M.MontreID = ?
  `;

  db.all(query, [MontreID], (err, rows) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).json({ error: 'Internal server error' });
      return
    } else {
      res.json(rows);
    }
  });
});

// ----------- AJOUTER MONTRE ------------------

// Ajouter une montre uniquement si l'utilisateur est connecté
app.post('/montre/ajout', verifierToken, (req, res) => {
  const {
    NomMontre,
    BoitierID,
    TextureBoitierID,
    PierreID,
    TextureBraceletID
  } = req.body;

  const UserID = req.UserID; 

  const insertQuery = `
    INSERT INTO Montres (UserID, NomMontre, BoitierID, TextureBoitierID, PierreID, TextureBraceletID)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(insertQuery, [UserID, NomMontre, BoitierID, TextureBoitierID, PierreID, TextureBraceletID], (err) => {
    if (err) {
      console.error('Erreur lors de l\'ajout de la montre:', err.message);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.json({ message: 'Montre ajoutée avec succès' });
    }
  });
});

// -------------- UPDATE MONTRE ------------------

// Mettre à jour une montre par son ID avec les éléments associés
app.put('/montre/:MontreID/modif', (req, res) => {
  const { MontreID } = req.params;
  const {
    NomMontre,
    BoitierID,
    TextureBoitierID,
    PierreID,
    TextureBraceletID
  } = req.body;

  const query = `
    UPDATE Montres
    SET
      NomMontre = ?,
      BoitierID = ?,
      TextureBoitierID = ?,
      PierreID = ?,
      TextureBraceletID = ?
    WHERE MontreID = ?
  `;

  db.run(
    query,
    [NomMontre, BoitierID, TextureBoitierID, PierreID, TextureBraceletID, MontreID],
    (err) => {
      if (err) {
        console.error('Error executing query:', err.message);
        res.status(500).json({ error: 'Internal server error' });
        return;
      } else {
        res.json({ message: 'Watch updated successfully' });
      }
    }
  );
});

// Mettre à jour la configuration d’une montre déjà existante dans la base de données.
app.put('/montre/:MontreID/modif2', (req, res) => {
  const { MontreID } = req.params;
  const { NomMontre, TextureBoitier, FormeBoitier, TextureBracelet, NomPierre } = req.body;



  // vérifie si la montre existe avant de la modifier
  db.all(`
      SELECT *
      FROM Montres 
      WHERE MontreID = ?
      `, [MontreID], (err, montre_existe) => {

    if (err) {
      console.error("Erreur, les montres n'ont pas pu être récupérées : ", err.message);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // si elle existe, la modifier
    if (montre_existe.length > 0) {
      db.run(`
          UPDATE Montres
          SET NomMontre = ?,
          BoitierID = (SELECT BoitierID FROM Boitier WHERE NomBoitier = ?),
          TextureBoitierID = (SELECT TextureBoitierID FROM TextureBoitier WHERE NomTexture = ?),
          PierreID = (SELECT PierreID FROM Pierres WHERE NomPierre = ?),
          TextureBraceletID = (SELECT TextureBraceletID FROM TextureBracelet WHERE NomTexture = ?)
          WHERE MontreID = ?
          `, [NomMontre, FormeBoitier, TextureBoitier, NomPierre, TextureBracelet, MontreID], (err) => {

        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        res.json({ message: 'La montre a été modifiée avec succès.' });
      });
    } else {
      res.json({ message: "Cette montre n'existe pas." });
    }
  });
});



// -------------- DELETE MONTRE ------------------

// Supprimer une montre par son ID
app.delete('/montre/:MontreID/suppr', (req, res) => {
  const { MontreID } = req.params;

  const deleteQuery = 'DELETE FROM Montres WHERE MontreID = ?';

  db.run(deleteQuery, [MontreID], (err) => {
    if (err) {
      console.error('Erreur lors de la suppression de la montre:', err.message);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.json({ message: 'Montre supprimer avec succès' });
    }
  });
});

// ------------- PANIER ------------------

// Gérer l'ajout au panier
app.post('/panier/ajout', verifierToken, (req, res) => {
  const { UserID } = req;
  const { MontreID, Quantite } = req.body; 

  const insertQuery = `
    INSERT INTO Panier (UserID, MontreID, Quantite)
    VALUES (?, ?, ?)
  `;

  db.run(insertQuery, [UserID, MontreID, Quantite || 1], (err) => {
    if (err) {
      console.error('Erreur lors de l\'ajout de la montre au panier:', err.message);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.json({ message: 'Montre ajoutée au panier avec succès' });
    }
  });
});

// Afficher la liste du panier de l'utilisateur connecté
app.get('/panier/liste', verifierToken, (req, res) => {
  const UserID = req.UserID;

  const query = `
    SELECT P.PanierID, M.NomMontre, B.NomBoitier, TB.NomTexture AS TextureBoitier, P.Quantite, (B.Prix + TB.Prix) AS PrixTotal
    FROM Panier AS P
    INNER JOIN Montres AS M ON P.MontreID = M.MontreID
    INNER JOIN Boitier AS B ON M.BoitierID = B.BoitierID
    INNER JOIN TextureBoitier AS TB ON M.TextureBoitierID = TB.TextureBoitierID
    WHERE P.UserID = ?
  `;

  db.all(query, [UserID], (err, rows) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Supprimer une montre du panier
app.delete('/panier/:PanierID/suppr', verifierToken, (req, res) => {
  const { PanierID } = req.params;

  const deleteQuery = 'DELETE FROM Panier WHERE PanierID = ?';

  db.run(deleteQuery, [PanierID], (err) => {
    if (err) {
      console.error('Erreur lors de la suppression de la montre du panier:', err.message);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    } else {
      res.json({ message: 'Montre supprimée du panier avec succès' });
    }
  });
});




// -------------- LISTE ------------------

// Afficher la liste de tous les boitiers
app.get('/boitiers', (req, res) => {
  const query = 'SELECT * FROM Boitier';

  db.all(query, [], (err, Boitier) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(Boitier);
  });
});

// Afficher la liste de toutes les pierres
app.get('/pierres', (req, res) => {
  const query = 'SELECT * FROM Pierres';

  db.all(query, [], (err, Pierres) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(Pierres);
  });
});

// Afficher la liste de tous les bracelets
app.get('/bracelets', (req, res) => {
  const query = 'SELECT * FROM Bracelet';

  db.all(query, [], (err, Bracelets) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(Bracelets);
  });
});

// Afficher la liste de toutes les textures de boitiers
app.get('/texturesBoitier', (req, res) => {
  const query = 'SELECT * FROM TextureBoitier';

  db.all(query, [], (err, texturesBoitier) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(texturesBoitier);
  });
});

// Afficher la liste de toutes les textures de bracelets
app.get('/texturesBracelet', (req, res) => {
  const query = 'SELECT * FROM TextureBracelet';

  db.all(query, [], (err, texturesBracelet) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(texturesBracelet);
  });
});






// ----------------------------------------


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
