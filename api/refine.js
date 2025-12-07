import { api_tool } from "bytez.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing 'text'" });

  try {
    // List available actions
    const actions = await api_tool.list_resources({ type: "action" });
    if (!actions || actions.length === 0) return res.status(500).json({ error: "No actions available" });

    const action_id = actions[0].id; // pick first available action

    // Run the action
    const response = await api_tool.run({
      action: action_id,
      inputs: [
        { role: "user", content: text }
      ]
    });

    return res.status(200).json({ refinedText: response.output?.content || text });
  } catch (err) {
    return res.status(502).json({ error: "AI failed", details: err.message });
  }
}
