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
    <div class="variant-options" id="diameter-options">
      <button class="variant-btn active" data-value="25.4">25.4 mm &mdash; US Standard</button>
      <button class="variant-btn" data-value="30">30 mm &mdash; EU Standard</button>
    </div>
  </div>

  <div class="variant-group">
    <div class="variant-label">Height</div>
    <div class="variant-height-wrap">
      <input type="number" id="height-input" min="15" max="70" value="30" step="1">
      <span class="variant-unit">mm</span>
      <span class="variant-hint">(15&ndash;70)</span>
    </div>
  </div>

  <div class="variant-group">
    <div class="variant-label">Quantity</div>
    <div class="variant-options" id="qty-options">
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
  var diameter = '25.4';
  var height = '30';
  var qty = 'single';

  function updateButton() {
    var ref = 'dia-' + diameter + 'mm_h-' + height + 'mm_qty-' + qty;
    var btnSingle = document.getElementById('btn-single');
    var btnPair = document.getElementById('btn-pair');
    if (qty === 'pair') {
      btnSingle.style.display = 'none';
      btnPair.style.display = '';
      btnPair.setAttribute('client-reference-id', ref);
    } else {
      btnSingle.style.display = '';
      btnPair.style.display = 'none';
      btnSingle.setAttribute('client-reference-id', ref);
    }
  }

  document.getElementById('diameter-options').addEventListener('click', function(e) {
    var btn = e.target.closest('.variant-btn');
    if (!btn) return;
    diameter = btn.dataset.value;
    document.querySelectorAll('#diameter-options .variant-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    updateButton();
  });

  document.getElementById('qty-options').addEventListener('click', function(e) {
    var btn = e.target.closest('.variant-btn');
    if (!btn) return;
    qty = btn.dataset.value;
    document.querySelectorAll('#qty-options .variant-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    updateButton();
  });

  document.getElementById('height-input').addEventListener('change', function() {
    var v = parseInt(this.value, 10);
    if (v >= 15 && v <= 70) {
      height = String(v);
      updateButton();
    } else {
      this.value = height;
    }
  });

  updateButton();
</script>

<a href="{{ '/' | relative_url }}" class="back-link">← Back to shop</a>
