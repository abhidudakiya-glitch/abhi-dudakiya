const express = require('express');
const cors = require('cors');

const app = express();

// Allow the frontend to communicate with this backend
app.use(cors());
app.use(express.json());

app.post('/api/get-video', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Using a free public API to extract the video
        // Note: You can replace this with any reliable RapidAPI Instagram downloader if this public endpoint goes down
        const response = await fetch(`https://api.snapinsta.app/api/ig/video?url=${url}`);
        
        // If the public API fails or blocks us, it will throw an error caught below
        const textData = await response.text();
        
        // Just a basic fallback to see if we can find an mp4 link in the raw HTML/JSON response of the tool
        const mp4Match = textData.match(/https:\/\/[^"']+\.mp4[^"']*/);

        if (mp4Match && mp4Match[0]) {
            res.json({ videoUrl: mp4Match[0] });
        } else {
            res.status(404).json({ error: 'Video not found or could not be extracted' });
        }
    } catch (error) {
        console.error('Scraping Error:', error);
        res.status(500).json({ error: 'Failed to extract video' });
    }
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Instagram Scraper Backend running on http://localhost:${PORT}`);
    });
}