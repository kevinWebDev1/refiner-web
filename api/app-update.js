export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const current = req.query.version || "1.0.0";
  const LATEST = "1.5.0";
  const UPDATE_URL = "https://refine-board-landing-page.vercel.app";

  const isNewer = (a, b) => {
    const ap = a.split(".").map(Number);
    const bp = b.split(".").map(Number);
    for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
      const av = ap[i] || 0;
      const bv = bp[i] || 0;
      if (av > bv) return true;
      if (av < bv) return false;
    }
    return false;
  };

  return res.status(200).json({
    updateAvailable: isNewer(LATEST, current),
    latestVersion: LATEST,
    forceUpdate: false,
    updateUrl: UPDATE_URL
  });
}
