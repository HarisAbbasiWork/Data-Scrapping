const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();
 
// URL of the web page to scrape
const url = 'https://liquipedia.net/valorant/Acend_Rising/Matches';

// Function to fetch data from the URL
async function fetchData() {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Function to fetch and encode logo data asynchronously
async function fetchLogoData(logoUrl) {
  try {
    const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
  } catch (error) {
    console.error('Error fetching logo:', error);
    return '';
  }
}

// Route to fetch the scraped data
app.get('/api/matches', async (req, res) => {
  const data = await fetchData();
  if (!data) {
    return res.status(500).json({ error: 'Error fetching data' });
  }

  const $ = cheerio.load(data);
  const matches = [];

  // Find the table with match data
  const table = $('table.wikitable');

  // Find all rows in the table (excluding the header row)
  const rows = table.find('tr').slice(1);

  // Iterate over the rows and extract the data
  for (let i = 0; i < rows.length; i++) {
    const columns = $(rows[i]).find('td');
    const date = columns.eq(0).text().trim();
    const tournament = columns.eq(1).text().trim();
    const opponent = columns.eq(2).text().trim();
    const result = columns.eq(3).text().trim();
    const logoImg = columns.eq(7).find('img');
    let logoData = '';

    if (logoImg.length > 0) {
      const logoSrc = logoImg.attr('src');
      const logoUrl = 'https://liquipedia.net' + logoSrc;
      logoData = await fetchLogoData(logoUrl);
    }

    matches.push({
      date: date,
      tournament: tournament,
      opponent: opponent,
      result: result,
      logo_data: logoData
    });
  }

  res.json(matches);
});
app.get('/ping', async (req, res) => {
  console.log("i am running ")
  res.status(200).json({
    success:true,
    message:"Iam running"
  })
})
// Run the web application
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log("haris")
});
