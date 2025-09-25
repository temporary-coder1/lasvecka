export default async function handler(req, res) {
  try {
    const response = await fetch("https://lasvecka.nu/data", {
      headers: { 
        "Content-Type": "application/json",
       }
    });
    const data = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*"); // allow frontend access
    res.status(200).send(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}