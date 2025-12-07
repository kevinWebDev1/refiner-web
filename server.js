export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Respond with a simple message
  return res.status(200).json({ message: "Refiner AI Backup – LIVE" });
}
