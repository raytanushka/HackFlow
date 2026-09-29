import { db, audit, nowIso } from "../db/database.js";

function getToken(req) {
  const auth = req.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  const cookieHeader = req.get("cookie");
  const match = cookieHeader?.match(/(?:^|;\s*)session=([^;]+)/);
  return match?.[1] || null;
}


export function optionalAuth(req, _res, next) {
  const token = getToken(req);

  console.log("\n--- AUTH DEBUG ---");
  console.log("URL:", req.method, req.originalUrl);
  console.log("Cookie:", req.get("cookie"));
  console.log("Authorization:", req.get("authorization"));
  console.log("Extracted token:", token);

  if (!token) {
    console.log("AUTH RESULT: NO TOKEN");
    return next();
  }

  const row = db.prepare(`
    SELECT s.token, s.expires_at, u.id, u.name, u.email, u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > ?
  `).get(token, nowIso());

  console.log("Session lookup:", row);

  if (row) {
    req.user = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      sessionToken: row.token
    };

    console.log("AUTH RESULT:", req.user);
  } else {
    console.log("AUTH RESULT: TOKEN NOT FOUND / EXPIRED");
  }

  next();
}



export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    next();
  });
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

export function logAudit(req, action, resource, resourceId, metadata = {}) {
  audit(req.user?.id || null, action, resource, resourceId, metadata);
}
