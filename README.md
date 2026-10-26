# Projet apprenant — TP n°2 : transformer le chatbot en assistant métier

## Installation

```bash
npm install
```

Dupliquez `.env.example`, renommez la copie `.env`, puis renseignez votre clé API Groq.

```bash
npm run dev
```

Ouvrez ensuite :

```text
http://localhost:3000
```

## Mission

Conservez l’architecture actuelle. Le refactoring en routes, controllers et services sera réalisé au Jour 3.

Votre travail porte principalement sur la constante `SYSTEM_PROMPT` dans `server.js`.

Vous devez transformer le chatbot générique en assistant réellement adapté au cahier des charges de votre groupe.

Le contrat de l’API ne change pas :

```json
{ "prompt": "..." }
```

```json
{ "answer": "..." }
```
