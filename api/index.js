export default function handler(req, res) {
  return res.status(200).json({
    message: "Refiner AI backend is LIVE! Use /refine POST to refine text."
  });
}
