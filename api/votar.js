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
    return res.status(400).json({ error: 'Dados incompletos', received: { codigo, nome, squad, voto } });
  }

  if (!process.env.NOTION_TOKEN) {
    return res.status(500).json({ error: 'NOTION_TOKEN nao configurado' });
  }

  if (!process.env.NOTION_DATABASE_ID) {
    return res.status(500).json({ error: 'NOTION_DATABASE_ID nao configurado' });
  }

  try {
    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        'Name': {
          title: [{ text: { content: `${codigo} - ${nome}` } }]
        },
        'Codigo': {
          rich_text: [{ text: { content: String(codigo) } }]
        },
        'Nome': {
          rich_text: [{ text: { content: String(nome) } }]
        },
        'Squad': {
          rich_text: [{ text: { content: String(squad) } }]
        },
        'Premio': {
          rich_text: [{ text: { content: String(voto) } }]
        },
        'Data': {
          date: { start: new Date().toISOString() }
        },
      },
    });

    return res.status(200).json({ success: true, id: response.id });
  } catch (err) {
    const detail = err?.body ? JSON.parse(err.body) : err?.message;
    console.error('Notion error:', detail);
    return res.status(500).json({
      error: 'Erro ao gravar no Notion',
      detail,
      token_ok: !!process.env.NOTION_TOKEN,
      db_ok: !!process.env.NOTION_DATABASE_ID,
    });
  }
}
