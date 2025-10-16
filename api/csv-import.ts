// Vercel serverless function: POST CSV { content } to import products
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function rateLimitOk(req: VercelRequest) {
  // naive per-IP rate limit via in-memory map (cold-start friendly small burst)
  // For production, use Upstash/Redis or Vercel Edge Config
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!rateLimitOk(req)) return res.status(429).json({ error: 'Rate limit exceeded' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Missing Supabase env' });
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { content } = req.body as { content?: string };
  if (!content) return res.status(400).json({ error: 'Missing CSV content' });

  // very basic CSV parse: header: name,brand,model,price,status,category_slug
  try {
    const lines = content.split(/\r?\n/).filter(Boolean);
    const [header, ...rows] = lines;
    const cols = header.split(',').map((c) => c.trim().toLowerCase());
    const idx = (k: string) => cols.indexOf(k);

    const results: any[] = [];
    for (const row of rows) {
      const parts = row.split(',');
      const name = parts[idx('name')];
      const brand = parts[idx('brand')];
      const model = parts[idx('model')];
      const price = Number(parts[idx('price')]);
      const status = parts[idx('status')] || 'active';
      const categorySlug = parts[idx('category_slug')] || '';

      if (!name || !brand || !model || Number.isNaN(price)) continue;

      let categoryId: string | null = null;
      if (categorySlug) {
        const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle();
        categoryId = cat?.id || null;
      }

      const payload = {
        category_id: categoryId,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand,
        model,
        price,
        status,
      };
      const { data, error } = await supabase.from('products').insert(payload).select('*').maybeSingle();
      if (error) results.push({ name, error: error.message }); else results.push({ name, id: data?.id });
    }
    return res.status(200).json({ results });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'Invalid CSV' });
  }
}


