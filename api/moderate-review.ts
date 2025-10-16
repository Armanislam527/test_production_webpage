// Basic review moderation toggle (approve/reject) by admin token
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken || req.headers.authorization !== `Bearer ${adminToken}`) return res.status(401).json({ error: 'Unauthorized' });

  const { reviewId, status } = req.body as { reviewId?: string; status?: 'approved' | 'rejected' };
  if (!reviewId || !status) return res.status(400).json({ error: 'Invalid payload' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Missing Supabase env' });
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase.from('reviews').update({ status }).eq('id', reviewId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}


