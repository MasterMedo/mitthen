(function () {
  var config_element = document.getElementById('product-config');
  var CONFIG = {
    standard_us_sleeve_diameter_mm: parseFloat(config_element.dataset.usDiameter),
    standard_eu_sleeve_diameter_mm: parseFloat(config_element.dataset.euDiameter),
    outer_diameter_mm:              parseFloat(config_element.dataset.outerDiameter),
    height_min_mm:                  parseFloat(config_element.dataset.heightMin),
    height_max_mm:                  parseFloat(config_element.dataset.heightMax),
    default_height_mm:              parseFloat(config_element.dataset.heightDefault)
  };
  var WORKER_URL = config_element.dataset.workerUrl;

  var state = {
    inner_diameter_mm: CONFIG.standard_us_sleeve_diameter_mm,
    height_mm: CONFIG.default_height_mm,
    quantity: 'single'
  };

  var snackbar_timeout = null;

  function validate_height(height_value) {
    if (isNaN(height_value) || !Number.isInteger(height_value)) {
      return { valid: false, message: 'Height must be a whole number between ' + CONFIG.height_min_mm + ' and ' + CONFIG.height_max_mm + ' mm' };
    }
    if (height_value < CONFIG.height_min_mm) {
      return { valid: true, clamped: true, value: CONFIG.height_min_mm, message: 'Height snapped to minimum: ' + CONFIG.height_min_mm + ' mm' };
    }
    if (height_value > CONFIG.height_max_mm) {
      return { valid: true, clamped: true, value: CONFIG.height_max_mm, message: 'Height snapped to maximum: ' + CONFIG.height_max_mm + ' mm' };
    }
    return { valid: true, clamped: false, value: height_value };
  }

  function show_snackbar(message) {
    var snackbar = document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.classList.add('visible');
    clearTimeout(snackbar_timeout);
    snackbar_timeout = setTimeout(function () {
      snackbar.classList.remove('visible');
    }, 3000);
  }

  function notify_price_elements() {
    document.querySelectorAll('price-display').forEach(function (el) {
      el.refresh();
    });
  }

  customElements.define('inner-diameter-picker', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML =
        '<div class="variant-group">' +
          '<div class="variant-label">Inner Diameter</div>' +
          '<div class="variant-options" id="inner-diameter-options">' +
            '<button class="variant-btn active" data-value="' + CONFIG.standard_us_sleeve_diameter_mm + '">' +
              CONFIG.standard_us_sleeve_diameter_mm + ' mm &mdash; US Standard' +
            '</button>' +
            '<button class="variant-btn" data-value="' + CONFIG.standard_eu_sleeve_diameter_mm + '">' +
              CONFIG.standard_eu_sleeve_diameter_mm + ' mm &mdash; EU Standard' +
            '</button>' +
          '</div>' +
        '</div>';

      this.querySelector('#inner-diameter-options').addEventListener('click', function (event) {
        var clicked = event.target.closest('.variant-btn');
        if (!clicked) return;
        this.querySelectorAll('.variant-btn').forEach(function (btn) { btn.classList.remove('active'); });
        clicked.classList.add('active');
        state.inner_diameter_mm = parseFloat(clicked.dataset.value);
        notify_price_elements();
      }.bind(this));
    }
  });

  customElements.define('height-picker', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML =
        '<div class="variant-group">' +
          '<div class="variant-label">Height</div>' +
          '<div class="variant-height-wrap">' +
            '<input type="range" id="height-input"' +
              ' min="' + CONFIG.height_min_mm + '"' +
              ' max="' + CONFIG.height_max_mm + '"' +
              ' value="' + CONFIG.default_height_mm + '"' +
              ' step="1">' +
            '<span class="variant-height-value" id="height-value">' + CONFIG.default_height_mm + ' mm</span>' +
          '</div>' +
        '</div>';

      var input = this.querySelector('#height-input');
      var label = this.querySelector('#height-value');

      input.addEventListener('input', function () {
        label.textContent = this.valueAsNumber + ' mm';
      });

      input.addEventListener('change', function () {
        var result = validate_height(this.valueAsNumber);
        if (!result.valid) {
          this.value = state.height_mm;
          label.textContent = state.height_mm + ' mm';
          show_snackbar(result.message);
        } else if (result.clamped) {
          state.height_mm = result.value;
          this.value = state.height_mm;
          label.textContent = state.height_mm + ' mm';
          show_snackbar(result.message);
          notify_price_elements();
        } else {
          state.height_mm = result.value;
          notify_price_elements();
        }
      });
    }
  });

  customElements.define('quantity-picker', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML =
        '<div class="variant-group">' +
          '<div class="variant-label">Quantity</div>' +
          '<div class="variant-options" id="quantity-options">' +
            '<button class="variant-btn active" data-value="single">Single</button>' +
            '<button class="variant-btn" data-value="pair">Pair</button>' +
          '</div>' +
        '</div>';

      this.querySelector('#quantity-options').addEventListener('click', function (event) {
        var clicked = event.target.closest('.variant-btn');
        if (!clicked) return;
        this.querySelectorAll('.variant-btn').forEach(function (btn) { btn.classList.remove('active'); });
        clicked.classList.add('active');
        state.quantity = clicked.dataset.value;
        notify_price_elements();
      }.bind(this));
    }
  });

  customElements.define('price-display', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = '<div class="buy-wrap"><div class="product-price" id="product-price">CHF &mdash;</div></div>';
      this.refresh();
    }

    async refresh() {
      var price_element = this.querySelector('#product-price');
      if (!price_element) return;
      var units = state.quantity === 'pair' ? 2 : 1;
      var params = new URLSearchParams({
        inner_diameter_mm: state.inner_diameter_mm,
        outer_diameter_mm: CONFIG.outer_diameter_mm,
        height_mm: state.height_mm,
        quantity: units
      });
      try {
        var response = await fetch(WORKER_URL + '/price?' + params);
        var data = await response.json();
        price_element.textContent = 'CHF ' + data.total_price_chf.toFixed(2);
      } catch (error) {
        price_element.textContent = 'CHF \u2014';
      }
    }
  });

  customElements.define('buy-button', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML =
        '<button class="checkout-btn" id="checkout-btn">Buy Now</button>' +
        '<div class="checkout-error" id="checkout-error"></div>';

      this.querySelector('#checkout-btn').addEventListener('click', async function () {
        var btn = this.querySelector('#checkout-btn');
        var error_element = this.querySelector('#checkout-error');
        btn.disabled = true;
        btn.textContent = 'Processing...';
        error_element.textContent = '';

        var items = [{
          inner_diameter_mm: state.inner_diameter_mm,
          outer_diameter_mm: CONFIG.outer_diameter_mm,
          height_mm: state.height_mm,
          quantity: state.quantity === 'pair' ? 2 : 1
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
          error_element.textContent = 'Checkout failed \u2014 please try again.';
          btn.disabled = false;
          btn.textContent = 'Buy Now';
        }
      }.bind(this));
    }
  });

  customElements.define('product-gallery', class extends HTMLElement {
    connectedCallback() {
      var src_list = (this.getAttribute('images') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (src_list.length === 0) return;

      var index = 0;
      var self = this;

      function is_video(src) { return /\.(mp4|webm)$/i.test(src); }

      function media_tag(src) {
        if (is_video(src)) {
          return '<video class="gallery-media" src="/assets/' + src + '" autoplay muted loop playsinline></video>';
        }
        return '<img class="gallery-media" src="/assets/' + src + '" alt="">';
      }

      function thumbs_html() {
        return src_list.map(function (src, i) {
          var cls = 'gallery-thumb' + (i === index ? ' active' : '');
          if (is_video(src)) {
            return '<button class="' + cls + '" data-i="' + i + '" aria-label="Go to video ' + (i + 1) + '">' +
              '<video src="/assets/' + src + '" muted></video>' +
            '</button>';
          }
          return '<button class="' + cls + '" data-i="' + i + '" aria-label="Go to image ' + (i + 1) + '">' +
            '<img src="/assets/' + src + '" alt="">' +
          '</button>';
        }).join('');
      }

      function render() {
        var nav = src_list.length > 1
          ? '<div class="gallery-nav">' +
              '<button class="gallery-arrow gallery-prev" aria-label="Previous">&#8592;</button>' +
              '<div class="gallery-thumbs">' + thumbs_html() + '</div>' +
              '<button class="gallery-arrow gallery-next" aria-label="Next">&#8594;</button>' +
            '</div>'
          : '';
        self.innerHTML =
          '<div class="gallery-wrap">' +
            media_tag(src_list[index]) +
            nav +
          '</div>';

        if (src_list.length > 1) {
          self.querySelector('.gallery-prev').addEventListener('click', function () {
            index = (index - 1 + src_list.length) % src_list.length;
            render();
          });
          self.querySelector('.gallery-next').addEventListener('click', function () {
            index = (index + 1) % src_list.length;
            render();
          });
          self.querySelectorAll('.gallery-thumb').forEach(function (btn) {
            btn.addEventListener('click', function () {
              index = parseInt(btn.dataset.i, 10);
              render();
            });
          });
        }
      }

      render();
    }
  });

  customElements.define('back-to-shop', class extends HTMLElement {
    connectedCallback() {
      var href = document.querySelector('base') ? '/' : (window.location.pathname.replace(/\/[^/]*$/, '/') || '/');
      this.innerHTML = '<a href="/" class="back-link">\u2190 Back to shop</a>';
    }
  });

  // Wrap pickers in the variant-selector div once DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    var pickers = document.querySelectorAll('inner-diameter-picker, height-picker, quantity-picker');
    if (pickers.length === 0) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'variant-selector';
    pickers[0].parentNode.insertBefore(wrapper, pickers[0]);
    pickers.forEach(function (el) { wrapper.appendChild(el); });
  });
})();
