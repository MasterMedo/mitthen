---
layout: page
title: Barbell Collar 1 Inch to 2 Inch Adapter
---

<img src="{{ '/assets/adapter.png' | relative_url }}" alt="Barbell Collar 1 Inch to 2 Inch Adapter" class="product-image">

<h1 class="product-title">Barbell Collar<br>1&Prime; to 2&Prime; Adapter</h1>

<p class="product-desc">
  Adapt your 1-inch barbell / dumbbell / loading pin to fit 2-inch Olympic weight plates.
  Solid construction, secure fit — no wobble, no compromise.
</p>

<div class="variant-selector">
  <div class="variant-group">
    <div class="variant-label">Inner Diameter</div>
    <div class="variant-options" id="inner-diameter-options">
      <button class="variant-btn active" data-value="{{ site.data.collar_config.standard_us_sleeve_diameter_mm }}">{{ site.data.collar_config.standard_us_sleeve_diameter_mm }} mm &mdash; US Standard</button>
      <button class="variant-btn" data-value="{{ site.data.collar_config.standard_eu_sleeve_diameter_mm }}">{{ site.data.collar_config.standard_eu_sleeve_diameter_mm }} mm &mdash; EU Standard</button>
    </div>
  </div>

  <div class="variant-group">
    <div class="variant-label">Height</div>
    <div class="variant-height-wrap">
      <input type="number" id="height-input"
        min="{{ site.data.collar_config.height_min_mm }}"
        max="{{ site.data.collar_config.height_max_mm }}"
        value="{{ site.data.collar_config.default_height_mm }}"
        step="1">
      <span class="variant-unit">mm</span>
      <span class="variant-hint">({{ site.data.collar_config.height_min_mm }}&ndash;{{ site.data.collar_config.height_max_mm }})</span>
    </div>
  </div>

  <div class="variant-group">
    <div class="variant-label">Quantity</div>
    <div class="variant-options" id="quantity-options">
      <button class="variant-btn active" data-value="single">Single</button>
      <button class="variant-btn" data-value="pair">Pair</button>
    </div>
  </div>
</div>

<div class="buy-wrap">
  <div class="product-price" id="product-price">CHF —</div>
  <button class="checkout-btn" id="checkout-btn">Buy Now</button>
  <div class="checkout-error" id="checkout-error"></div>
</div>

<script>
  var CONFIG = {
    standard_us_sleeve_diameter_mm: {{ site.data.collar_config.standard_us_sleeve_diameter_mm }},
    standard_eu_sleeve_diameter_mm: {{ site.data.collar_config.standard_eu_sleeve_diameter_mm }},
    outer_diameter_mm:              {{ site.data.collar_config.outer_diameter_mm }},
    height_min_mm:                  {{ site.data.collar_config.height_min_mm }},
    height_max_mm:                  {{ site.data.collar_config.height_max_mm }},
    default_height_mm:              {{ site.data.collar_config.default_height_mm }}
  };

  var WORKER_URL = 'https://mitthen-checkout.mitthen-com.workers.dev';

  var inner_diameter_mm = CONFIG.standard_us_sleeve_diameter_mm;
  var height_mm = CONFIG.default_height_mm;
  var quantity = 'single';

  async function update_price() {
    var price_element = document.getElementById('product-price');
    var units = quantity === 'pair' ? 2 : 1;
    var params = new URLSearchParams({
      inner_diameter_mm: inner_diameter_mm,
      outer_diameter_mm: CONFIG.outer_diameter_mm,
      height_mm: height_mm,
      quantity: units
    });
    try {
      var response = await fetch(WORKER_URL + '/price?' + params);
      var data = await response.json();
      price_element.textContent = 'CHF ' + data.total_price_chf.toFixed(2);
    } catch (error) {
      price_element.textContent = 'CHF —';
    }
  }

  document.getElementById('inner-diameter-options').addEventListener('click', function(event) {
    var clicked_button = event.target.closest('.variant-btn');
    if (!clicked_button) return;
    inner_diameter_mm = parseFloat(clicked_button.dataset.value);
    document.querySelectorAll('#inner-diameter-options .variant-btn').forEach(function(button) { button.classList.remove('active'); });
    clicked_button.classList.add('active');
    update_price();
  });

  document.getElementById('quantity-options').addEventListener('click', function(event) {
    var clicked_button = event.target.closest('.variant-btn');
    if (!clicked_button) return;
    quantity = clicked_button.dataset.value;
    document.querySelectorAll('#quantity-options .variant-btn').forEach(function(button) { button.classList.remove('active'); });
    clicked_button.classList.add('active');
    update_price();
  });

  document.getElementById('height-input').addEventListener('change', function() {
    var height_value = this.valueAsNumber;
    if (Number.isInteger(height_value) && height_value >= CONFIG.height_min_mm && height_value <= CONFIG.height_max_mm) {
      height_mm = height_value;
      update_price();
    } else {
      this.value = height_mm;
    }
  });

  document.getElementById('checkout-btn').addEventListener('click', async function() {
    var checkout_button = document.getElementById('checkout-btn');
    var error_element = document.getElementById('checkout-error');
    checkout_button.disabled = true;
    checkout_button.textContent = 'Processing...';
    error_element.textContent = '';

    var items = [{
      inner_diameter_mm: inner_diameter_mm,
      outer_diameter_mm: CONFIG.outer_diameter_mm,
      height_mm: height_mm,
      quantity: quantity === 'pair' ? 2 : 1
    }];

    try {
      var response = await fetch(WORKER_URL + '/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items })
      });
      var data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Unexpected error');
      }
    } catch (error) {
      error_element.textContent = 'Checkout failed — please try again.';
      checkout_button.disabled = false;
      checkout_button.textContent = 'Buy Now';
    }
  });

  update_price();
</script>

<a href="{{ '/' | relative_url }}" class="back-link">← Back to shop</a>
