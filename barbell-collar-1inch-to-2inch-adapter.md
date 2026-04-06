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
  <script async src="https://js.stripe.com/v3/buy-button.js"></script>
  <stripe-buy-button
    id="btn-single"
    buy-button-id="buy_btn_1TIQx121DbKYvUxM9Gh812th"
    publishable-key="pk_live_51TIOQ221DbKYvUxMY5e9qC8Obn8akN4b76mMGHhEibEtzDQVQb0dsUyoAurZyFYoucktNQOAgeY6huvcgLazF3OI00BXi11kaW"
  ></stripe-buy-button>
  <stripe-buy-button
    id="btn-pair"
    buy-button-id="buy_btn_1TIQx121DbKYvUxM9Gh812th"
    publishable-key="pk_live_51TIOQ221DbKYvUxMY5e9qC8Obn8akN4b76mMGHhEibEtzDQVQb0dsUyoAurZyFYoucktNQOAgeY6huvcgLazF3OI00BXi11kaW"
    style="display:none"
  ></stripe-buy-button>
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

  var inner_diameter_mm = CONFIG.standard_us_sleeve_diameter_mm;
  var height_mm = CONFIG.default_height_mm;
  var quantity = 'single';

  function updateButton() {
    var client_reference_id = 'inner_diameter_mm=' + inner_diameter_mm
      + '&outer_diameter_mm=' + CONFIG.outer_diameter_mm
      + '&height_mm=' + height_mm
      + '&quantity=' + quantity;
    var button_single = document.getElementById('btn-single');
    var button_pair = document.getElementById('btn-pair');
    if (quantity === 'pair') {
      button_single.style.display = 'none';
      button_pair.style.display = '';
      button_pair.setAttribute('client-reference-id', client_reference_id);
    } else {
      button_single.style.display = '';
      button_pair.style.display = 'none';
      button_single.setAttribute('client-reference-id', client_reference_id);
    }
  }

  document.getElementById('inner-diameter-options').addEventListener('click', function(event) {
    var clicked_button = event.target.closest('.variant-btn');
    if (!clicked_button) return;
    inner_diameter_mm = clicked_button.dataset.value;
    document.querySelectorAll('#inner-diameter-options .variant-btn').forEach(function(button) { button.classList.remove('active'); });
    clicked_button.classList.add('active');
    updateButton();
  });

  document.getElementById('quantity-options').addEventListener('click', function(event) {
    var clicked_button = event.target.closest('.variant-btn');
    if (!clicked_button) return;
    quantity = clicked_button.dataset.value;
    document.querySelectorAll('#quantity-options .variant-btn').forEach(function(button) { button.classList.remove('active'); });
    clicked_button.classList.add('active');
    updateButton();
  });

  document.getElementById('height-input').addEventListener('change', function() {
    var height_value = this.valueAsNumber;
    if (Number.isInteger(height_value) && height_value >= CONFIG.height_min_mm && height_value <= CONFIG.height_max_mm) {
      height_mm = height_value;
      updateButton();
    } else {
      this.value = height_mm;
    }
  });

  updateButton();
</script>

<a href="{{ '/' | relative_url }}" class="back-link">← Back to shop</a>
