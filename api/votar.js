import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { codigo, nome, squad, voto } = req.body || {};

  if (!codigo || !nome || !squad || !voto) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    return res.status(500).json({ error: 'Variaveis de ambiente nao configuradas' });
  }

  try {
    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        'C\u00f3digo': {
          title: [{ text: { content: codigo + ' - ' + nome } }]
        },
        'NomeSquad': {
          rich_text: [{ text: { content: nome + ' | ' + squad } }]
        },
        'Voto': {
          rich_text: [{ text: { content: String(voto) } }]
        },
        'Data': {
          date: { start: new Date().toISOString() }
        },
      },
    });

    return res.status(200).json({ success: true, id: response.id });
  } catch (err) {
    const detail = err && err.body ? JSON.parse(err.body) : (err && err.message);
    console.error('Notion error:', JSON.stringify(detail));
    return res.status(500).json({
      error: 'Erro ao gravar no Notion',
      detail: detail,
    });
  }
}
