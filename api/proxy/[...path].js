export default async function handler(req, res) {
  const getRawBody = async (req) => {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on && req.on('data', chunk => { data += chunk; });
      req.on && req.on('end', () => resolve(data));
      req.on && req.on('error', reject);
    });
  };

  try {
    const pathParam = req.query.path || [];
    const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam;
    const search = req.url && req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const target = `https://constraints-sunny-camp-antonio.trycloudflare.com/${path}${search}`;

    const headers = { ...req.headers };
    delete headers.host;

    const init = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const raw = await getRawBody(req);
      if (raw && raw.length > 0) init.body = raw;
    }

    const upstream = await fetch(target, init);
    // copy headers
    upstream.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.status(upstream.status || 200);
    const arrayBuffer = await upstream.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('proxy error', err);
    res.status(500).json({ error: String(err) });
  }
}
