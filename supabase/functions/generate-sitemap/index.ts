import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating sitemap.xml...');

    const baseUrl = 'https://kryptoanzeigen.de';
    const urls: SitemapUrl[] = [];

    // Static pages with high priority
    urls.push(
      { loc: baseUrl, lastmod: new Date().toISOString(), changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/browse`, lastmod: new Date().toISOString(), changefreq: 'hourly', priority: '0.9' },
      { loc: `${baseUrl}/categories`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.8' },
      { loc: `${baseUrl}/login`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.5' }
    );

    // Fetch active categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('active', true)
      .order('sort_order');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else {
      categories?.forEach(category => {
        urls.push({
          loc: `${baseUrl}/categories/${category.slug}`,
          lastmod: category.updated_at || new Date().toISOString(),
          changefreq: 'weekly',
          priority: '0.7'
        });
      });
    }

    // Fetch active ads (last 1000 for performance)
    const { data: ads, error: adsError } = await supabase
      .from('ads')
      .select('id, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1000);

    if (adsError) {
      console.error('Error fetching ads:', adsError);
    } else {
      ads?.forEach(ad => {
        urls.push({
          loc: `${baseUrl}/ad/${ad.id}`,
          lastmod: ad.updated_at || new Date().toISOString(),
          changefreq: 'weekly',
          priority: '0.6'
        });
      });
    }

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    console.log(`Generated sitemap with ${urls.length} URLs`);

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);