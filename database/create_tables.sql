-- Table Utilisateurs
CREATE TABLE Utilisateurs (
    UserID INTEGER PRIMARY KEY,
    NomUser VARCHAR(255) UNIQUE NOT NULL,
    MotDePasse VARCHAR(255) NOT NULL
);
-- Table Montres
CREATE TABLE Montres (
    MontreID INTEGER PRIMARY KEY,
    UserID INTEGER,
    NomMontre VARCHAR(255) UNIQUE NOT NULL,
    BoitierID INTEGER,
    TextureBoitierID INTEGER,
    PierreID INTEGER,
    TextureBraceletID INTEGER,
    FOREIGN KEY (UserID) REFERENCES Utilisateurs(UserID),
    FOREIGN KEY (BoitierID) REFERENCES Boitier(BoitierID),
    FOREIGN KEY (TextureBoitierID) REFERENCES TextureBoitier(TextureBoitierID),
    FOREIGN KEY (PierreID) REFERENCES Pierres(PierreID),
    FOREIGN KEY (TextureBraceletID) REFERENCES TextureBracelet(TextureBraceletID)
);
-- Table Boitier
CREATE TABLE Boitier (
    BoitierID INTEGER PRIMARY KEY,
    NomBoitier VARCHAR(255) UNIQUE NOT NULL,
    Prix DECIMAL(10, 2) NOT NULL
);
-- Table TextureBoitier
CREATE TABLE TextureBoitier (
    TextureBoitierID INTEGER PRIMARY KEY,
    NomTexture VARCHAR(255) UNIQUE NOT NULL,
    Chemin VARCHAR(255) NOT NULL,
    Prix DECIMAL(10, 2) NOT NULL
);
-- Table Pierre
CREATE TABLE Pierres (
    PierreID INTEGER PRIMARY KEY,
    NomPierre VARCHAR(255) UNIQUE NOT NULL,
    CouleurPierre VARCHAR(255) NOT NULL,
    Prix DECIMAL(10, 2) NOT NULL
);
-- Table Bracelet
CREATE TABLE Bracelet (
    BraceletID INTEGER PRIMARY KEY,
    NomBracelet VARCHAR(255) UNIQUE NOT NULL,
    Prix DECIMAL(10, 2) NOT NULL
);
-- Table TextureBracelet
CREATE TABLE TextureBracelet (
    TextureBraceletID INTEGER PRIMARY KEY,
    NomTexture VARCHAR(255) UNIQUE NOT NULL,
    Chemin VARCHAR(255) NOT NULL,
    Prix DECIMAL(10, 2) NOT NULL
);
-- Table Panier
CREATE TABLE Panier (
    PanierID INTEGER PRIMARY KEY,
    UserID INTEGER,
    MontreID INTEGER,
    Quantite INTEGER,
    FOREIGN KEY (UserID) REFERENCES Utilisateurs(UserID),
    FOREIGN KEY (MontreID) REFERENCES Montres(MontreID)
);