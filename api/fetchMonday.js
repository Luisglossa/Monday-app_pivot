export default async function handler(req, res) {
    const { query } = req.body;
  
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Authorization': process.env.M_api,
        'Content-Type': 'application/json',
        'API-Version': '2023-10'
      },
      body: JSON.stringify({ query })
    });
  
    const data = await response.json();
    res.status(200).json(data);
  }
  