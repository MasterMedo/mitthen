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
    inner_diameter_display: CONFIG.standard_us_sleeve_diameter_mm + 'mm',
    outer_diameter_display: CONFIG.outer_diameter_mm + 'mm',
    height_mm: CONFIG.default_height_mm,
    height_display: CONFIG.default_height_mm + 'mm',
    quantity: 'single',
    unit: 'mm'
  };

  function mm_to_in(mm) {
    return (mm / 25.4).toFixed(2);
  }

  // Fixed inch labels for known sleeve diameters; calculated fallback for others
  var IN_LABELS = {};
  IN_LABELS[CONFIG.standard_us_sleeve_diameter_mm] = '1\u2033';
  IN_LABELS[CONFIG.standard_eu_sleeve_diameter_mm] = '1.18\u2033';
  IN_LABELS[CONFIG.outer_diameter_mm] = '2\u2033';

  function format_id(mm) {
    return state.unit === 'in'
      ? (IN_LABELS[mm] || mm_to_in(mm) + '\u2033')
      : mm + 'mm';
  }

  function format_height(mm) {
    return state.unit === 'in'
      ? (mm / 25.4).toFixed(2) + '\u2033'
      : mm + 'mm';
  }



  var snackbar_timeout = null;

  // ── Cart helpers ──────────────────────────────────────────────────────────

  var CART_KEY = 'mitthen_cart';

  function cart_load() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function cart_save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    cart_notify();
  }

  function cart_clear() {
    localStorage.setItem(CART_KEY, JSON.stringify([]));
    cart_notify();
  }

  function cart_add(item) {
    var items = cart_load();
    var match = items.find(function (i) {
      return i.inner_diameter_mm === item.inner_diameter_mm &&
             i.outer_diameter_mm === item.outer_diameter_mm &&
             i.height_mm         === item.height_mm;
    });
    if (match) {
      match.quantity += item.quantity;
    } else {
      items.push(item);
    }
    cart_save(items);
    return items;
  }

  function cart_remove(index) {
    var items = cart_load();
    items.splice(index, 1);
    cart_save(items);
    return items;
  }

  /** Broadcast so header badge and open drawer refresh. */
  function cart_notify() {
    window.dispatchEvent(new CustomEvent('mitthen:cart-updated'));
  }

  // ── Shared utilities ──────────────────────────────────────────────────────

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

  function notify_unit_change() {
    document.querySelectorAll('inner-diameter-picker, outer-diameter-display, height-picker, cart-drawer').forEach(function (el) {
      if (typeof el.refresh === 'function') el.refresh();
      else if (typeof el._render === 'function') el._render();
    });
  }

  customElements.define('unit-toggle', class extends HTMLElement {
    connectedCallback() {
      this._render();
    }

    _render() {
      this.innerHTML =
        '<div class="variant-group">' +
          '<div class="variant-label">Units</div>' +
          '<div class="variant-options" id="unit-toggle-options">' +
            '<button class="variant-btn' + (state.unit === 'mm' ? ' active' : '') + '" data-value="mm">mm</button>' +
            '<button class="variant-btn' + (state.unit === 'in' ? ' active' : '') + '" data-value="in">in</button>' +
          '</div>' +
        '</div>';

      this.querySelector('#unit-toggle-options').addEventListener('click', function (event) {
        var clicked = event.target.closest('.variant-btn');
        if (!clicked) return;
        this.querySelectorAll('.variant-btn').forEach(function (btn) { btn.classList.remove('active'); });
        clicked.classList.add('active');
        state.unit = clicked.dataset.value;
        notify_unit_change();
      }.bind(this));
    }
  });

  customElements.define('inner-diameter-picker', class extends HTMLElement {
    connectedCallback() {
      this._render();
    }

    _render() {
      var us_mm = CONFIG.standard_us_sleeve_diameter_mm;
      var eu_mm = CONFIG.standard_eu_sleeve_diameter_mm;
      var us_label = format_id(us_mm) + ' \u2014 US Standard';
      var eu_label = format_id(eu_mm) + ' \u2014 EU Standard';
      var us_active = state.inner_diameter_mm === us_mm;
      state.inner_diameter_display = format_id(state.inner_diameter_mm);

      this.innerHTML =
        '<div class="variant-group">' +
          '<div class="variant-label">Inner Diameter</div>' +
          '<div class="variant-options" id="inner-diameter-options">' +
            '<button class="variant-btn' + (us_active ? ' active' : '') + '" data-value="' + us_mm + '">' +
              us_label +
            '</button>' +
            '<button class="variant-btn' + (!us_active ? ' active' : '') + '" data-value="' + eu_mm + '">' +
              eu_label +
            '</button>' +
          '</div>' +
        '</div>';

      this.querySelector('#inner-diameter-options').addEventListener('click', function (event) {
        var clicked = event.target.closest('.variant-btn');
        if (!clicked) return;
        this.querySelectorAll('.variant-btn').forEach(function (btn) { btn.classList.remove('active'); });
        clicked.classList.add('active');
        state.inner_diameter_mm = parseFloat(clicked.dataset.value);
        state.inner_diameter_display = format_id(state.inner_diameter_mm);
        notify_price_elements();
      }.bind(this));
    }

    refresh() {
      this._render();
    }
  });

  customElements.define('outer-diameter-display', class extends HTMLElement {
    connectedCallback() {
      this._render();
    }

    _render() {
      state.outer_diameter_display = format_id(CONFIG.outer_diameter_mm);
      this.innerHTML =
        '<div class="variant-group">' +
          '<div class="variant-label">Outer Diameter</div>' +
          '<div class="variant-options">' +
            '<span class="variant-btn active">' + state.outer_diameter_display + '</span>' +
          '</div>' +
        '</div>';
    }

    refresh() {
      this._render();
    }
  });

  customElements.define('height-picker', class extends HTMLElement {
    connectedCallback() {
      var initial_label = state.unit === 'in'
        ? mm_to_in(CONFIG.default_height_mm) + ' in'
        : CONFIG.default_height_mm + ' mm';

      this.innerHTML =
        '<div class="variant-group">' +
          '<div class="variant-label">Height</div>' +
          '<div class="variant-height-wrap">' +
            '<input type="range" id="height-input"' +
              ' min="' + CONFIG.height_min_mm + '"' +
              ' max="' + CONFIG.height_max_mm + '"' +
              ' value="' + CONFIG.default_height_mm + '"' +
              ' step="1">' +
            '<span class="variant-height-value" id="height-value">' + initial_label + '</span>' +
          '</div>' +
        '</div>';

      var input = this.querySelector('#height-input');
      var label = this.querySelector('#height-value');

      input.addEventListener('input', function () {
        label.textContent = state.unit === 'in'
          ? mm_to_in(this.valueAsNumber) + '\u2033'
          : this.valueAsNumber + 'mm';
        state.height_display = label.textContent;
      });

      input.addEventListener('change', function () {
        var result = validate_height(this.valueAsNumber);
        if (!result.valid) {
          this.value = state.height_mm;
          label.textContent = state.height_display;
          show_snackbar(result.message);
        } else if (result.clamped) {
          state.height_mm = result.value;
          this.value = state.height_mm;
          label.textContent = state.unit === 'in'
            ? mm_to_in(state.height_mm) + '\u2033'
            : state.height_mm + 'mm';
          state.height_display = label.textContent;
          show_snackbar(result.message);
          notify_price_elements();
        } else {
          state.height_mm = result.value;
          // height_display already updated by the preceding input event
          notify_price_elements();
        }
      });
    }

    refresh() {
      var label = this.querySelector('#height-value');
      if (!label) return;
      label.textContent = state.unit === 'in'
        ? mm_to_in(state.height_mm) + '\u2033'
        : state.height_mm + 'mm';
      state.height_display = label.textContent;
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
          quantity: state.quantity === 'pair' ? 2 : 1,
          display_name: 'Barbell Collar Adapter \u2014 ' + state.inner_diameter_display + ' ID, ' + state.outer_diameter_display + ' OD, ' + state.height_display + ' h'
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

  customElements.define('add-to-cart-button', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = '<button class="add-to-cart-btn" id="add-to-cart-btn">Add to Cart</button>';

      this.querySelector('#add-to-cart-btn').addEventListener('click', function () {
        var item = {
          inner_diameter_mm:      state.inner_diameter_mm,
          outer_diameter_mm:      CONFIG.outer_diameter_mm,
          height_mm:              state.height_mm,
          quantity:               state.quantity === 'pair' ? 2 : 1,
          inner_diameter_display: state.inner_diameter_display,
          outer_diameter_display: state.outer_diameter_display,
          height_display:         state.height_display
        };
        cart_add(item);
        show_snackbar('Added to cart');
        var drawer = document.querySelector('cart-drawer');
        if (drawer) drawer.open();
      });
    }
  });

  customElements.define('cart-drawer', class extends HTMLElement {
    connectedCallback() {
      this._render();
      window.addEventListener('mitthen:cart-updated', function () {
        this._render();
      }.bind(this));
    }

    open() {
      this.classList.add('is-open');
      document.body.classList.add('cart-drawer-open');
    }

    close() {
      this.classList.remove('is-open');
      document.body.classList.remove('cart-drawer-open');
    }

    _render() {
      var self = this;
      var items = cart_load();

      var items_html;
      if (items.length === 0) {
        items_html = '<p class="cart-empty">Your cart is empty.</p>';
      } else {
        items_html = '<ul class="cart-item-list">' +
          items.map(function (item, index) {
            var id_label = item.inner_diameter_display || format_id(item.inner_diameter_mm);
            var od_label = item.outer_diameter_display || format_id(item.outer_diameter_mm);
            var h_label  = item.height_display         || format_height(item.height_mm);
            return '<li class="cart-item" data-index="' + index + '">' +
              '<div class="cart-item-spec">' +
                '<div class="cart-item-spec-line"><span class="cart-item-spec-label">ID</span> ' + id_label + '</div>' +
                '<div class="cart-item-spec-line"><span class="cart-item-spec-label">OD</span> ' + od_label + '</div>' +
                '<div class="cart-item-spec-line"><span class="cart-item-spec-label">Height</span> ' + h_label + '</div>' +
                '<div class="cart-item-spec-qty">Quantity: ' + item.quantity + '</div>' +
              '</div>' +
              '<div class="cart-item-price" data-index="' + index + '">CHF \u2014</div>' +
              '<button class="cart-item-remove" data-index="' + index + '" aria-label="Remove item">&times;</button>' +
            '</li>';
          }).join('') +
        '</ul>';
      }

      var footer_html = items.length > 0
        ? '<div class="cart-footer">' +
            '<div class="cart-total" id="cart-total">Total: CHF \u2014</div>' +
            '<button class="checkout-btn cart-checkout-btn" id="cart-checkout-btn">Checkout</button>' +
            '<div class="checkout-error" id="cart-checkout-error"></div>' +
          '</div>'
        : '';

      this.innerHTML =
        '<div class="cart-backdrop"></div>' +
        '<div class="cart-panel">' +
          '<div class="cart-header">' +
            '<span class="cart-title">Cart</span>' +
            '<button class="cart-close" aria-label="Close cart">&times;</button>' +
          '</div>' +
          '<div class="cart-body">' + items_html + '</div>' +
          footer_html +
        '</div>';

      // Wire close
      this.querySelector('.cart-backdrop').addEventListener('click', function () { self.close(); });
      this.querySelector('.cart-close').addEventListener('click', function () { self.close(); });

      // Wire remove buttons
      this.querySelectorAll('.cart-item-remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = parseInt(btn.dataset.index, 10);
          cart_remove(idx);
        });
      });

      // Wire checkout
      var checkout_btn = this.querySelector('#cart-checkout-btn');
      if (checkout_btn) {
        checkout_btn.addEventListener('click', async function () {
          var error_el = self.querySelector('#cart-checkout-error');
          checkout_btn.disabled = true;
          checkout_btn.textContent = 'Processing...';
          if (error_el) error_el.textContent = '';

          var checkout_items = cart_load().map(function (i) {
            var id_label = i.inner_diameter_display || format_id(i.inner_diameter_mm);
            var od_label = i.outer_diameter_display || format_id(i.outer_diameter_mm);
            var h_label  = i.height_display         || format_height(i.height_mm);
            return {
              inner_diameter_mm: i.inner_diameter_mm,
              outer_diameter_mm: i.outer_diameter_mm,
              height_mm:         i.height_mm,
              quantity:          i.quantity,
              display_name:      'Barbell Collar Adapter \u2014 ' + id_label + ' ID, ' + od_label + ' OD, ' + h_label + ' h'
            };
          });

          try {
            var response = await fetch(WORKER_URL + '/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: checkout_items })
            });
            var data = await response.json();
            if (data.url) {
              window.location.href = data.url;
            } else {
              throw new Error(data.error || 'Unexpected error');
            }
          } catch (err) {
            if (error_el) error_el.textContent = 'Checkout failed \u2014 please try again.';
            checkout_btn.disabled = false;
            checkout_btn.textContent = 'Checkout';
          }
        });
      }

      // Fetch prices asynchronously
      if (items.length > 0) {
        self._fetch_prices(items);
      }
    }

    async _fetch_prices(items) {
      var self = this;
      var total = 0;
      var fetches = items.map(async function (item, index) {
        var params = new URLSearchParams({
          inner_diameter_mm: item.inner_diameter_mm,
          outer_diameter_mm: item.outer_diameter_mm,
          height_mm:         item.height_mm,
          quantity:          item.quantity
        });
        try {
          var response = await fetch(WORKER_URL + '/price?' + params);
          var data = await response.json();
          var price_el = self.querySelector('.cart-item-price[data-index="' + index + '"]');
          if (price_el) price_el.textContent = 'CHF ' + data.total_price_chf.toFixed(2);
          total += data.total_price_chf;
        } catch (e) {
          // leave as em dash
        }
      });
      await Promise.all(fetches);
      var total_el = self.querySelector('#cart-total');
      if (total_el) total_el.textContent = 'Total: CHF ' + total.toFixed(2);
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
    var pickers = document.querySelectorAll('unit-toggle, inner-diameter-picker, outer-diameter-display, height-picker, quantity-picker');
    if (pickers.length === 0) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'variant-selector';
    pickers[0].parentNode.insertBefore(wrapper, pickers[0]);
    pickers.forEach(function (el) { wrapper.appendChild(el); });
  });
})();
