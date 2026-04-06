const ALLOWED_ORIGIN = 'https://mitthen.com';
const CURRENCY = 'chf';
const DENSITY = 2903;
const PRICE_PER_GRAM_CHF = 0.4;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function calculate_price_chf(inner_diameter_mm, outer_diameter_mm, height_mm) {
  return height_mm * (outer_diameter_mm ** 2 - inner_diameter_mm ** 2) / DENSITY * PRICE_PER_GRAM_CHF;
}

function json_response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

async function handle_price(request) {
  const url = new URL(request.url);
  const inner_diameter_mm = parseFloat(url.searchParams.get('inner_diameter_mm'));
  const outer_diameter_mm = parseFloat(url.searchParams.get('outer_diameter_mm'));
  const height_mm = parseFloat(url.searchParams.get('height_mm'));
  const quantity = parseInt(url.searchParams.get('quantity'));

  if ([inner_diameter_mm, outer_diameter_mm, height_mm, quantity].some(isNaN)) {
    return json_response({ error: 'Missing or invalid parameters' }, 400);
  }

  const unit_price_chf = calculate_price_chf(inner_diameter_mm, outer_diameter_mm, height_mm);
  const total_price_chf = unit_price_chf * quantity;

  return json_response({ total_price_chf: Math.round(total_price_chf * 100) / 100 });
}

async function handle_checkout(request, env) {
  const { items } = await request.json();

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', ALLOWED_ORIGIN + '/order-confirmed');
  params.append('cancel_url', ALLOWED_ORIGIN + '/barbell-collar-1inch-to-2inch-adapter');
  params.append('metadata[items]', JSON.stringify(items));

  items.forEach((item, index) => {
    const unit_price_chf = calculate_price_chf(item.inner_diameter_mm, item.outer_diameter_mm, item.height_mm);
    const unit_amount_centimes = Math.round(unit_price_chf * 100);
    const product_name = `Barbell Collar Adapter — ${item.inner_diameter_mm}mm ID, ${item.height_mm}mm h`;
    params.append(`line_items[${index}][price_data][currency]`, CURRENCY);
    params.append(`line_items[${index}][price_data][unit_amount]`, String(unit_amount_centimes));
    params.append(`line_items[${index}][price_data][product_data][name]`, product_name);
    params.append(`line_items[${index}][quantity]`, String(item.quantity));
  });

  const stripe_response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.STRIPE_SECRET_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const session = await stripe_response.json();

  if (!stripe_response.ok) {
    return json_response({ error: session.error?.message }, 500);
  }

  return json_response({ url: session.url });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method === 'GET' && url.pathname === '/price') {
      return handle_price(request);
    }

    if (request.method === 'POST' && url.pathname === '/checkout') {
      return handle_checkout(request, env);
    }

    return new Response('Not found', { status: 404 });
  },
};
