-- Insertion de données dans la table Utilisateurs
INSERT INTO Utilisateurs (NomUser, MotDePasse)
VALUES ('Jean', 'motdepasse123'),
    ('Paul', 'mdp321');
-- Insertion de données dans la table Montres
INSERT INTO Montres (
        UserID,
        NomMontre,
        BoitierID,
        TextureBoitierID,
        PierreID,
        TextureBraceletID
    )
VALUES (1, 'Montre test', 1, 1, 1, 1),
    (1, 'Montre test 2', 2, 2, 2, 2),
    (2, 'Montre test 3', 1, 1, 1, 1),
    (2, 'Montre test 4', 2, 2, 2, 2);
-- Insertion de données dans la table Boitier
INSERT INTO Boitier (NomBoitier, Prix)
VALUES ('Boitier_carre', 50),
    ('Boitier_rond', 70);
-- Insertion de données dans la table TextureBoitier
INSERT INTO TextureBoitier (NomTexture, Chemin, Prix)
VALUES (
        'black01',
        'background_black01.png',
        10
    ),
    (
        'black02',
        'background_black02.png',
        20
    ),
    ('fluo01', 'background_fluo01.png', 50),
    ('mickey', 'background_mickey.png', 40),
    (
        'white01',
        'background_white01.png',
        20
    ),
    ('white02', 'background_white02.png', 20),
    (
        'white03',
        'background_white03.png',
        30
    ),
    (
        'white04',
        'background_white04.png',
        30
    ),
    (
        'white05',
        'background_white05.png',
        30
    );
-- Insertion de données dans la table Pierre
INSERT INTO Pierres (NomPierre, Prix, CouleurPierre)
VALUES ('Rubis', 20, '#ff0000'),
    ('Diamant', 100, '#0000ff'),
    ('Émeraude', 50, '#00ff00');
-- Insertion de données dans la table Bracelet
INSERT INTO Bracelet (NomBracelet, Prix)
VALUES ('Bracelet', 30),
    ('Fermoir', 10);
-- Insertion de données dans la table TextureBracelet
INSERT INTO TextureBracelet (NomTexture, Chemin, Prix)
VALUES ('metal', 'texture_metal.jpg', 70),
    ('cuir-blanc', 'texture-cuir-blanc.jpg', 90),
    ('tissus-marron', 'texture-tissus-marron.jpg', 90),
    ('tissus-or', 'texture_tissus-or.png', 40);
-- Insertion de données dans la table Panier
INSERT INTO Panier (UserID, MontreID)
VALUES (1, 1),
    (1, 2);