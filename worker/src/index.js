const ALLOWED_ORIGIN = 'https://mitthen.com';
const CURRENCY = 'chf';
const DENSITY = 2903;
const PRICE_PER_GRAM_CHF = 0.4;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function calculate_price_chf(inner_diameter_mm, outer_diameter_mm, height_mm) {
  return height_mm * (outer_diameter_mm ** 2 - inner_diameter_mm ** 2) / DENSITY * PRICE_PER_GRAM_CHF;
}

function build_line_item_params(item, index) {
  const unit_price_chf = calculate_price_chf(item.inner_diameter_mm, item.outer_diameter_mm, item.height_mm);
  const unit_amount_centimes = Math.round(unit_price_chf * 100);
  const product_name = `Barbell Collar Adapter — ${item.inner_diameter_mm}mm ID, ${item.height_mm}mm h`;

  return {
    [`line_items[${index}][price_data][currency]`]: CURRENCY,
    [`line_items[${index}][price_data][unit_amount]`]: String(unit_amount_centimes),
    [`line_items[${index}][price_data][product_data][name]`]: product_name,
    [`line_items[${index}][quantity]`]: String(item.quantity),
  };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { items } = await request.json();

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', ALLOWED_ORIGIN + '/order-confirmed');
    params.append('cancel_url', ALLOWED_ORIGIN + '/barbell-collar-1inch-to-2inch-adapter');
    params.append('metadata[items]', JSON.stringify(items));

    items.forEach((item, index) => {
      const line_item_params = build_line_item_params(item, index);
      for (const [key, value] of Object.entries(line_item_params)) {
        params.append(key, value);
      }
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
      return new Response(JSON.stringify({ error: session.error?.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  },
};
