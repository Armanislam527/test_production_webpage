// scripts/generate-sitemap.js
import { writeFileSync } from 'fs';
import { supabase } from '../src/lib/supabase';

async function generateSitemap() {
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at');

  const baseUrl = 'https://techspecdev.vercel.app';
  const pages = ['', '/about', '/contact']; // Add other static pages

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
    <url>
      <loc>${baseUrl}${page}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${page === '' ? '1.0' : '0.8'}</priority>
    </url>`
    )
    .join('')}
  ${products
    .map(
      (product) => `
    <url>
      <loc>${baseUrl}/products/${product.slug}</loc>
      <lastmod>${new Date(product.updated_at).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
    )
    .join('')}
</urlset>`;

  writeFileSync('./public/sitemap.xml', sitemap);
  console.log('Sitemap generated successfully!');
}

generateSitemap().catch(console.error);