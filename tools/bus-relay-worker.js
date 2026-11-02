/*
  Lumi bus relay (Cloudflare Worker)
  LTA DataMall's Bus Arrival API needs an AccountKey and does not allow web pages on a tablet to call it
  directly. This tiny relay asks LTA for you and passes the answer back to Lumi.

  Set up (free):
  1. Get an AccountKey: https://datamall.lta.gov.sg (Request for API Access).
  2. Cloudflare dashboard > Workers & Pages > Create Worker. Paste this file and Deploy.
  3. Worker > Settings > Variables and secrets: add a Secret called LTA_KEY with your AccountKey.
  4. Copy the worker link (https://something.workers.dev) into Lumi > Grown-ups > Child > Bus times.
*/
export default {
  async fetch(request, env) {
    const cors = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'AccountKey, accept',
      'access-control-allow-methods': 'GET, OPTIONS'
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(request.url);
    const stop = url.searchParams.get('BusStopCode') || '';
    if (!/^\d{5}$/.test(stop)) return new Response(JSON.stringify({ error: 'BusStopCode must be 5 digits' }), { status: 400, headers: { ...cors, 'content-type': 'application/json' } });
    const key = env.LTA_KEY || request.headers.get('AccountKey') || '';
    const lta = await fetch(`https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${stop}`, {
      headers: { AccountKey: key, accept: 'application/json' }
    });
    return new Response(await lta.text(), {
      status: lta.status,
      headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'max-age=20' }
    });
  }
};
