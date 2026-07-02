import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { codigo, nome, squad, voto } = req.body;

    if (!codigo || !nome || !squad || !voto) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        'Código': { title: [{ text: { content: codigo } }] },
        'Nome':   { rich_text: [{ text: { content: nome } }] },
        'Squad':  { select: { name: squad } },
        'Voto':   { select: { name: voto.length > 100 ? voto.substring(0, 100) : voto } },
        'Data':   { date: { start: new Date().toISOString() } },
      },
    });

    return res.status(200).json({ success: true, message: 'Voto registrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao gravar no Notion:', err);
    return res.status(500).json({ error: 'Erro ao gravar no Notion', details: err.message });
  }
}
