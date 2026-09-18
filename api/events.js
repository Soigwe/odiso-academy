// Vercel Serverless Function: GET /api/events
// Connects to Notion Database or falls back to local assets/data/events.json

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const notionApiKey = process.env.NOTION_API_KEY;
  const notionDatabaseId = process.env.NOTION_EVENTS_DATABASE_ID;

  // If Notion credentials are provided in Vercel Environment Variables, fetch directly from Notion
  if (notionApiKey && notionDatabaseId) {
    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${notionDatabaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionApiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filter: {
            property: 'Published',
            checkbox: {
              equals: true
            }
          },
          sorts: [
            {
              property: 'Date',
              direction: 'ascending'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Notion API returned ${response.status}`);
      }

      const data = await response.json();
      const events = data.results.map(page => {
        const props = page.properties;
        
        const title = props.Title?.title?.[0]?.plain_text || 'Untitled Event';
        const date = props.Date?.date?.start || new Date().toISOString().split('T')[0];
        const category = props.Category?.select?.name || 'General';
        const summary = props.Summary?.rich_text?.[0]?.plain_text || '';
        const location = props.Location?.rich_text?.[0]?.plain_text || 'Lagos / Abuja Hub';
        const badge = props.Badge?.rich_text?.[0]?.plain_text || category;
        const author = props.Author?.rich_text?.[0]?.plain_text || 'OLA Faculty';

        return {
          id: page.id,
          title,
          date,
          category,
          summary,
          location,
          badge,
          author,
          published: true
        };
      });

      return res.status(200).json({ success: true, source: 'notion', events });
    } catch (err) {
      console.error('Error querying Notion:', err);
      // Fallback to static data on error
    }
  }

  // Default fallback to static event data
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'assets', 'data', 'events.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const staticEvents = JSON.parse(rawData);
    return res.status(200).json({ success: true, source: 'fallback', events: staticEvents });
  } catch (err) {
    return res.status(200).json({
      success: true,
      source: 'inline',
      events: [
        {
          id: "event-1",
          title: "2026/2027 STEAAM Admissions Aptitude Assessment",
          category: "Admissions",
          date: "2026-10-15",
          time: "09:00 AM WAT",
          location: "Lagos & Abuja Hubs",
          summary: "Entrance exam for prospective scholars across Nigeria.",
          badge: "Admissions",
          published: true
        }
      ]
    });
  }
}
