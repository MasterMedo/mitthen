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

  var inner_diameter_mm = CONFIG.standard_us_sleeve_diameter_mm;
  var height_mm = CONFIG.default_height_mm;
  var quantity = 'single';
  var snackbar_timeout = null;

  // Returns { clamped, value, message } — value and message only set when clamped or invalid
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

  function select_option(group_id, clicked_button) {
    document.querySelectorAll('#' + group_id + ' .variant-btn').forEach(function (button) {
      button.classList.remove('active');
    });
    clicked_button.classList.add('active');
  }

  document.getElementById('inner-diameter-options').addEventListener('click', function (event) {
    var clicked_button = event.target.closest('.variant-btn');
    if (!clicked_button) return;
    inner_diameter_mm = parseFloat(clicked_button.dataset.value);
    select_option('inner-diameter-options', clicked_button);
    update_price();
  });

  document.getElementById('quantity-options').addEventListener('click', function (event) {
    var clicked_button = event.target.closest('.variant-btn');
    if (!clicked_button) return;
    quantity = clicked_button.dataset.value;
    select_option('quantity-options', clicked_button);
    update_price();
  });

  document.getElementById('height-input').addEventListener('change', function () {
    var result = validate_height(this.valueAsNumber);
    if (!result.valid) {
      this.value = height_mm;
      show_snackbar(result.message);
    } else if (result.clamped) {
      height_mm = result.value;
      this.value = height_mm;
      show_snackbar(result.message);
      update_price();
    } else {
      height_mm = result.value;
      update_price();
    }
  });

  document.getElementById('checkout-btn').addEventListener('click', async function () {
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
})();
