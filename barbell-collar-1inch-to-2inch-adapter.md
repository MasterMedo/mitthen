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

<div id="product-config"
  data-us-diameter="{{ site.data.collar_config.standard_us_sleeve_diameter_mm }}"
  data-eu-diameter="{{ site.data.collar_config.standard_eu_sleeve_diameter_mm }}"
  data-outer-diameter="{{ site.data.collar_config.outer_diameter_mm }}"
  data-height-min="{{ site.data.collar_config.height_min_mm }}"
  data-height-max="{{ site.data.collar_config.height_max_mm }}"
  data-height-default="{{ site.data.collar_config.default_height_mm }}"
  data-worker-url="https://mitthen-checkout.mitthen-com.workers.dev"
></div>

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

<a href="{{ '/' | relative_url }}" class="back-link">← Back to shop</a>

<div class="snackbar" id="snackbar"></div>

<script src="{{ '/assets/product.js' | relative_url }}"></script>
