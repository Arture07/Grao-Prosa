import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy para Overpass API (OpenStreetMap)
  // Soluciona a restrição de CORS e bloqueio do navegador chamando a Overpass API server-side
  app.get('/api/overpass/cafes', async (req, res) => {
    try {
      const { lat, lng, radius = '15000' } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          status: 'INVALID_REQUEST',
          error_message: 'Parâmetros lat e lng são obrigatórios.',
          elements: []
        });
      }

      console.log(`[Server Overpass Proxy] Buscando cafeterias no OSM para lat: ${lat}, lng: ${lng}, radius: ${radius}m`);

      const query = `[out:json][timeout:25];(node["amenity"="cafe"](around:${radius},${lat},${lng}););out center;`;
      
      const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
      ];

      let lastError: Error | null = null;
      let data: any = null;

      for (const endpoint of endpoints) {
        try {
          const url = `${endpoint}?data=${encodeURIComponent(query)}`;
          console.log(`[Server Overpass Proxy] Tentando endpoint: ${endpoint}`);
          const osmRes = await fetch(url, {
            headers: {
              'User-Agent': 'GraoEProsa/1.0 (Coffee Explorer App)'
            }
          });

          if (osmRes.ok) {
            data = await osmRes.json();
            if (data && Array.isArray(data.elements)) {
              console.log(`[Server Overpass Proxy Sucesso] Endpoint ${endpoint} retornou ${data.elements.length} elementos.`);
              return res.json(data);
            }
          } else {
            console.warn(`[Server Overpass Proxy Warning] ${endpoint} retornou HTTP ${osmRes.status}`);
          }
        } catch (e: any) {
          console.warn(`[Server Overpass Proxy Warning] Falha no endpoint ${endpoint}:`, e?.message);
          lastError = e;
        }
      }

      throw lastError || new Error('Não foi possível obter dados de nenhum servidor Overpass API.');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[Server Overpass Proxy Catch]', err);
      return res.status(500).json({
        status: 'SERVER_ERROR',
        error_message: err.message || 'Erro ao comunicar com o OpenStreetMap',
        elements: []
      });
    }
  });

  // API Proxy para Google Places Nearby Search
  // Soluciona a restrição de CORS do navegador chamando a API do Google server-side
  app.get('/api/places/nearby', async (req, res) => {
    try {
      const { lat, lng, radius = '15000', type = 'cafe', keyword, pagetoken } = req.query;

      const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';

      if (!apiKey || apiKey === 'YOUR_GOOGLE_API_KEY') {
        console.warn('[Server API Proxy Warning] GOOGLE_MAPS_API_KEY não configurada no ambiente.');
        return res.json({
          status: 'REQUEST_DENIED',
          error_message: 'Chave da API do Google Maps (GOOGLE_MAPS_API_KEY) não configurada no ambiente backend.',
          results: []
        });
      }

      let googleUrl = '';
      if (pagetoken) {
        console.log(`[Server API Proxy] Buscando próxima página com pagetoken...`);
        googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${encodeURIComponent(String(pagetoken))}&key=${apiKey}`;
      } else {
        if (!lat || !lng) {
          return res.status(400).json({
            status: 'INVALID_REQUEST',
            error_message: 'Parâmetros lat e lng são obrigatórios.',
            results: []
          });
        }
        console.log(`[Server API Proxy] Buscando cafeterias para lat: ${lat}, lng: ${lng}, radius: ${radius}m, type: ${type}, keyword: ${keyword || 'nenhuma'}`);
        googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
        if (keyword) {
          googleUrl += `&keyword=${encodeURIComponent(String(keyword))}`;
        }
      }

      const googleRes = await fetch(googleUrl);
      
      if (!googleRes.ok) {
        console.error(`[Server API Proxy Error] HTTP ${googleRes.status}: ${googleRes.statusText}`);
        return res.status(googleRes.status).json({
          status: 'HTTP_ERROR',
          error_message: `Google Places API retornou erro HTTP ${googleRes.status}`,
          results: []
        });
      }

      const data = await googleRes.json();
      console.log(`[Server API Proxy Response] Status: ${data.status}, Encontrados: ${data.results?.length || 0}, NextToken: ${data.next_page_token ? 'SIM' : 'NÃO'}`);
      
      return res.json(data);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[Server API Proxy Catch]', err);
      return res.status(500).json({
        status: 'SERVER_ERROR',
        error_message: err.message || 'Erro interno no servidor proxy',
        results: []
      });
    }
  });

  // Middleware do Vite para ambiente de desenvolvimento e estáticos para produção
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
