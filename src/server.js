import { PORT } from "./config/index.js";
import app from "./app.js";

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
