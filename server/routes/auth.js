const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const authHeader = req.body.token;
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) return res.status(401).json({ erro: "Token não fornecido" });
  
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.usuario = payload;
      next();
    } catch (err) {
      return res.status(403).json({ erro: "Token inválido ou expirado" });
    }
});

module.exports = router;