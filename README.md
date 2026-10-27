# Projet apprenant — TP n°3

## Objectif

Optimiser l’assistant métier construit pendant le TP n°2.

Vous devez travailler sur :
- les tests ;
- les erreurs observées ;
- le prompt système ;
- le format des réponses ;
- les limites ;
- l’incertitude ;
- la température.

## Interdiction pédagogique

Le projet est désormais organisé dans `src/` :

```text
src/
├── config/        # variables d'environnement, client Groq, prompt système
├── controllers/   # logique des requêtes HTTP
├── routes/        # définition des routes
├── services/      # appels au fournisseur d'IA
├── public/        # interface web
├── app.js         # configuration Express
└── server.js      # point d'entrée
```

## Lancement

```bash
npm install
npm run dev
```

Ouvrez ensuite :

```text
http://localhost:3000
```

Dupliquez `.env.example` et renommez la copie `.env`.
