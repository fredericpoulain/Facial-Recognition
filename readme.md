**# Application de reconnaissance faciale**

Ce projet est une application web qui permet de s’identifier à l’aide de son visage et de son mot de passe. Il utilise
une technique de reconnaissance faciale basée sur les descripteurs, qui sont des tableaux de 128 nombres flottants
représentant les caractéristiques du visage. Il utilise également un système de sécurité par token de session, qui
garantit l’authenticité de l’utilisateur.

**## Technologies utilisées**

* PHP
* Symfony
* javascript
* HTML
* CSS

## **Installation**

Pour installer et exécuter ce projet, vous devez avoir un serveur web compatible avec PHP et Symfony, ainsi qu’une base
de données MySQL. Vous devez également avoir un navigateur web moderne qui supporte l’utilisation de la webcam.

* Clonez ou téléchargez ce dépôt sur votre serveur web.
* Créez une base de données MySQL et importez le fichier database.sql qui se trouve dans le dossier sql.
* Modifiez le fichier .env qui se trouve à la racine du projet, et renseignez les informations de connexion à votre base de données.
* Lancez la commande composer install pour installer les dépendances PHP.
* Lancez la commande symfony server:start pour démarrer le serveur web.
* Ouvrez votre navigateur web et accédez à l’URL du projet.

## **Utilisation**
* Pour vous inscrire, vous devez saisir votre email, votre mot de passe, et capturer votre visage avec la webcam. Un descripteur de votre visage sera alors enregistré en base de données.
* Pour vous connecter, vous devez saisir votre email, puis cliquer sur le bouton “Reconnaissance faciale”. Votre visage sera alors comparé au descripteur stocké en base de données. 
Si la reconnaissance est réussie, vous devrez ensuite saisir votre mot de passe pour finaliser la connexion.