// Logic for VOLTRIX STORE

// Admin configuration
const ADMIN_CONFIG = {
  mode: 'local',
  secretKey: 'voltrix-admin-2025'
};

// Default products shown when there is no saved product list
const DEFAULT_PRODUCTS = [
  { id: 1, category: 'contas', categoryName: 'Contas', name: 'Codiguim Free Fire x50', originalPrice: 29.90, price: 14.90, image: '', svgClass: 'blue', svgContent: '' }
];

const CATEGORY_LIST = [
  { id: 'contas', name: 'Contas' },
  { id: 'outros', name: 'Outros' }
];

let products = [];
let cart = [];
let appliedCoupon = null;
let currentStep = 1;
let userData = { name: '', email: '', whatsapp: '' };
let checkPaymentInterval = null;
let pixConfig = null;
let pixCopyPaste = '';
let adminLoggedIn = false;
let adminEditingProductId = null;
let pixUploadedDataUrl = null;

// OPTIONAL DEFAULT PIX (set to a payload if you want the site to prefill PIX config on first load)
// WARNING: embedding real payloads in source is sensitive. Keep empty string to disable.
const DEFAULT_PIX_PAYLOAD = '00020126330014BR.GOV.BCB.PIX0111130692779005204000053039865802BR5923MARCIO RAFAEL R AMERICO6009SAO PAULO622605227RCJHrfdDClLHnyGJH75Ov63040691';
const DEFAULT_PIX_QR_URL = DEFAULT_PIX_PAYLOAD ? ('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(DEFAULT_PIX_PAYLOAD)) : '';

window.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCart();
  pixConfig = loadPixConfig();
  updatePixCopyPaste();
  renderProductGrids();
  updateCartUI();
  setupEventListeners();
  checkAdminSession();
  applyDefaultPixIfNeeded();
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

function applyDefaultPixIfNeeded() {
  try {
    if (typeof DEFAULT_PIX_PAYLOAD === 'string' && DEFAULT_PIX_PAYLOAD.trim().length > 8) {
      const existing = loadPixConfig() || {};
      // overwrite or set payload and qrImageUrl so the site always uses the provided values
      existing.payload = DEFAULT_PIX_PAYLOAD;
      existing.qrImageUrl = DEFAULT_PIX_QR_URL || existing.qrImageUrl;
      savePixConfigToStorage(existing);
      pixConfig = existing;
      updatePixCopyPaste();
    }
  } catch (e) {
    console.warn('applyDefaultPixIfNeeded error', e);
  }
}

function loadProducts() {
  const saved = localStorage.getItem('sitevoltrix_products');
  if (saved) {
    try {
      products = JSON.parse(saved);
    } catch (e) {
      products = [...DEFAULT_PRODUCTS];
    }
  } else {
    products = [...DEFAULT_PRODUCTS];
  }
}

function saveProducts() {
  localStorage.setItem('sitevoltrix_products', JSON.stringify(products));
}

function getNextProductId() {
  if (!products.length) return 1;
  return Math.max(...products.map(p => p.id)) + 1;
}

function loadCart() {
  const saved = localStorage.getItem('sitevoltrix_cart');
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch (e) {
      cart = [];
    }
  }
}

function saveCart() {
  localStorage.setItem('sitevoltrix_cart', JSON.stringify(cart));
}

function setupEventListeners() {
  const cartButton = document.getElementById('header-cart-button');
  const drawerClose = document.getElementById('drawer-close');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const checkoutClose = document.getElementById('checkout-close');
  const roletaFloat = document.getElementById('roleta-float');
  const roletaClose = document.getElementById('roleta-close');
  const feedbackClose = document.getElementById('feedback-close');

  if (cartButton) cartButton.addEventListener('click', openCart);
  if (drawerClose) drawerClose.addEventListener('click', closeCart);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeCart);
  if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);
  if (roletaFloat) roletaFloat.addEventListener('click', openRoletaModal);
  if (roletaClose) roletaClose.addEventListener('click', closeRoletaModal);
  if (feedbackClose) feedbackClose.addEventListener('click', closeFeedbackModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCart();
      closeCheckout();
      closeRoletaModal();
      closeFeedbackModal();
      closeLoginModal(null, true);
      closeAdminProductModal();
      closePixConfigModal();
    }
  });

  document.addEventListener('click', (event) => {
    const supportMenu = document.getElementById('support-menu');
    const supportButton = document.getElementById('support-button');
    if (supportMenu && supportButton && !supportButton.contains(event.target) && !supportMenu.contains(event.target)) {
      supportMenu.classList.remove('show');
    }
  });
}

function renderProductGrids() {
  const container = document.getElementById('categories-container');
  if (!container) return;
  container.innerHTML = '';

  CATEGORY_LIST.forEach(category => {
    const categoryProducts = products.filter(product => product.category === category.id);
    const block = document.createElement('div');
    block.className = 'category-block';
    block.id = 'cat-block-' + category.id;

    const header = document.createElement('div');
    header.className = 'category-header-wrap';
    header.innerHTML = `
      <h3 class="category-header-title">${category.name}</h3>
      <div class="category-header-line"></div>
    `;

    block.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'product-grid';

    if (categoryProducts.length === 0) {
      const empty = document.createElement('div');
      empty.style.gridColumn = '1 / -1';
      empty.style.padding = '1.2rem';
      empty.style.color = '#cbd5e1';
      empty.style.background = 'rgba(255,255,255,0.03)';
      empty.style.border = '1px solid rgba(255,255,255,0.06)';
      empty.style.borderRadius = '16px';
      empty.textContent = 'Nenhum produto disponível nesta categoria.';
      grid.appendChild(empty);
    } else {
      categoryProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const adminActionsMarkup = adminLoggedIn ? `
          <div class="product-admin-actions">
            <button type="button" class="btn btn-icon btn-secondary" onclick="openAdminProductModal(${product.id})" title="Editar produto">
              <i data-lucide="edit-2" style="width:1.1rem;height:1.1rem;"></i>
            </button>
            <button type="button" class="btn btn-icon btn-secondary" onclick="deleteProduct(${product.id})" title="Remover produto">
              <i data-lucide="trash-2" style="width:1.1rem;height:1.1rem;"></i>
            </button>
          </div>
        ` : '';
        card.innerHTML = `
          <div class="product-img-wrapper">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-img">` : `<div class="product-img" style="background: ${getColorForClass(product.svgClass)}; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:0.95rem;">${product.categoryName.split(' ')[0] || 'PRO'}</div>`}
          </div>
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-pricing">
              <div class="price-original">R$ ${product.originalPrice.toFixed(2)}</div>
              <div class="price-current">R$ ${product.price.toFixed(2)}</div>
            </div>
            ${adminActionsMarkup}
            <button class="btn btn-primary" type="button" onclick="addToCart(${product.id})">Adicionar ao carrinho</button>
          </div>
        `;
        grid.appendChild(card);
      });
    }

    block.appendChild(grid);
    container.appendChild(block);
  });
  updateCategoryCardStatus();
}

function updateCategoryCardStatus() {
  CATEGORY_LIST.forEach((category) => {
    const card = document.querySelector(`.category-card[data-category="${category.id}"]`);
    if (!card) return;
    const count = products.filter((product) => product.category === category.id).length;
    let status = card.querySelector('.category-card-status');
    if (!status) {
      status = document.createElement('span');
      status.className = 'category-card-status';
      card.appendChild(status);
    }
    status.textContent = count === 0 ? 'Sem produtos' : `${count} ${count === 1 ? 'produto' : 'produtos'}`;
    status.classList.toggle('empty', count === 0);
  });
}

function getColorForClass(svgClass) {
  switch (svgClass) {
    case 'purple': return 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)';
    case 'blue': return 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)';
    case 'red': return 'linear-gradient(135deg, #ef4444 0%, #fb7185 100%)';
    case 'green': return 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)';
    case 'amber': return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
    default: return 'linear-gradient(135deg, #334155 0%, #0f172a 100%)';
  }
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    showToast('Produto não encontrado.');
    return;
  }

  const item = cart.find((entry) => entry.id === productId);
  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  updateCartUI();
  showToast('Produto adicionado ao carrinho.');
}

function removeCartItem(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const container = document.getElementById('cart-items-container');
  const totalLabel = document.getElementById('cart-total-value');
  const badge = document.querySelector('.cart-btn-badge');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  if (!container || !totalLabel || !checkoutBtn) return;

  container.innerHTML = '';
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) {
    badge.textContent = String(count);
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  if (cart.length === 0) {
    container.innerHTML = '<p style="color: #cbd5e1; line-height:1.6;">Seu carrinho está vazio. Adicione produtos para prosseguir.</p>';
    totalLabel.textContent = 'R$ 0,00';
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = '0.65';
    return;
  }

  let total = 0;
  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return;
    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.gap = '0.75rem';
    row.style.marginBottom = '0.75rem';
    row.style.padding = '0.85rem';
    row.style.background = 'rgba(255,255,255,0.03)';
    row.style.borderRadius = '12px';

    row.innerHTML = `
      <div style="flex:1; min-width:0;">
        <div style="font-weight:700; margin-bottom:0.25rem; color:#fff;">${product.name}</div>
        <div style="font-size:0.85rem; color:#94a3b8;">${item.quantity} x R$ ${product.price.toFixed(2)}</div>
      </div>
      <div style="text-align:right; display:flex; flex-direction:column; gap:0.35rem;">
        <span style="font-weight:700; color:#fff;">R$ ${itemTotal.toFixed(2)}</span>
        <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.45rem 0.75rem;" onclick="removeCartItem(${product.id})">Remover</button>
      </div>
    `;

    container.appendChild(row);
  });

  totalLabel.textContent = `R$ ${total.toFixed(2)}`;
  checkoutBtn.disabled = false;
  checkoutBtn.style.opacity = '1';
}

function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (!drawer || !overlay) return;
  drawer.classList.add('open');
  overlay.classList.add('open');
}

function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (!drawer || !overlay) return;
  drawer.classList.remove('open');
  overlay.classList.remove('open');
}

function openCheckout() {
  if (!cart.length) {
    showToast('Adicione produtos ao carrinho antes de finalizar a compra.');
    return;
  }
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;
  currentStep = 1;
  goToStep(1);
  updateCheckoutSummary();
  // ensure pix payload/qr are up-to-date before showing
  pixConfig = loadPixConfig() || pixConfig;
  updatePixCopyPaste();
  const keyEl = document.getElementById('pix-key-val');
  if (keyEl) keyEl.textContent = pixCopyPaste;
  const qrImg = document.getElementById('pix-qr-img');
  if (qrImg) {
    if (pixConfig && pixConfig.qrImageUrl) qrImg.src = pixConfig.qrImageUrl;
    else qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(pixCopyPaste);
  }
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function goToStep(step) {
  currentStep = step;
  const steps = document.querySelectorAll('.checkout-step');
  steps.forEach((stepEl) => {
    stepEl.classList.toggle('active', stepEl.id === `checkout-step-${step}`);
  });
  if (step === 3) {
    updatePixCopyPaste();
    const keyEl = document.getElementById('pix-key-val');
    if (keyEl) keyEl.textContent = pixCopyPaste;
    const qrImg = document.getElementById('pix-qr-img');
    if (qrImg) {
      if (pixConfig && pixConfig.qrImageUrl) {
        qrImg.src = pixConfig.qrImageUrl;
      } else {
        // generate QR image via public API based on the payload
        const data = encodeURIComponent(pixCopyPaste);
        qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + data;
      }
    }
  }
}

function submitStep1() {
  const nameInput = document.getElementById('chk-name');
  const emailInput = document.getElementById('chk-email');
  const whatsappInput = document.getElementById('chk-whatsapp');
  if (!nameInput || !emailInput || !whatsappInput) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const whatsapp = whatsappInput.value.trim();

  if (!name || !email || !whatsapp) {
    showToast('Preencha todos os dados para continuar.');
    return;
  }

  userData = { name, email, whatsapp };
  goToStep(2);
}

function handleCheckoutCouponBtn() {
  const couponInput = document.getElementById('chk-coupon-input');
  const feedback = document.getElementById('coupon-feedback');
  if (!couponInput || !feedback) return;

  const code = couponInput.value.trim().toUpperCase();
  if (!code) {
    feedback.textContent = 'Digite um cupom válido.';
    return;
  }

  const couponsList = {
    VX10: 0.10,
    VX20: 0.20,
    SENSI50: 0.50,
    VX5: 0.05,
    VX15: 0.15
  };

  if (couponsList[code]) {
    appliedCoupon = { code, discount: couponsList[code] };
    feedback.textContent = `Cupom aplicado: ${code}`;
    updateCheckoutSummary();
    showToast('Cupom aplicado com sucesso!');
  } else {
    appliedCoupon = null;
    feedback.textContent = 'Cupom inválido ou expirado.';
  }
}

function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);
  const discount = appliedCoupon ? subtotal * appliedCoupon.discount : 0;
  const total = Math.max(subtotal - discount, 0);
  return { subtotal, discount, total, quantity: cart.reduce((sum, item) => sum + item.quantity, 0) };
}

function updateCheckoutSummary() {
  const summary = calculateTotals();
  const qtyEl = document.getElementById('checkout-sum-qty');
  const subtotalEl = document.getElementById('checkout-sum-subtotal');
  const discountEl = document.getElementById('checkout-sum-discount');
  const totalEl = document.getElementById('checkout-sum-total');

  if (qtyEl) qtyEl.textContent = `${summary.quantity} item${summary.quantity !== 1 ? 's' : ''}`;
  if (subtotalEl) subtotalEl.textContent = `R$ ${summary.subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `R$ ${summary.discount.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `R$ ${summary.total.toFixed(2)}`;
}

function updatePixCopyPaste() {
  const total = calculateTotals().total;
  if (pixConfig && pixConfig.payload && pixConfig.payload.trim()) {
    pixCopyPaste = pixConfig.payload.trim();
    return;
  }
  if (pixConfig && pixConfig.chave) {
    pixCopyPaste = generatePixCode(pixConfig.chave, pixConfig.nome || 'VOLTRIX STORE', pixConfig.cidade || 'Sao Paulo', total);
  } else {
    pixCopyPaste = '00020101021226930014br.gov.bcb.pix2571pix-sitevoltrix@intermediador.com52040000530398654050.005802BR5915VX_VENDAS_CLONE6009Sao_Paulo62070503***6304' + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
  }
}

function copyPixKey() {
  if (!pixCopyPaste) {
    showToast('Nenhum código Pix disponível.');
    return;
  }
  navigator.clipboard.writeText(pixCopyPaste).then(() => {
    showToast('Código Pix copiado para a área de transferência!');
  }).catch(() => {
    showToast('Não foi possível copiar. Tente novamente.');
  });
}

function openLoginModal() {
  const modal = document.getElementById('login-modal-overlay');
  if (!modal) return;
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('active'));
}

function closeLoginModal(event, force) {
  const modal = document.getElementById('login-modal-overlay');
  if (!modal) return;
  if (force || !event || event.target === modal) {
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
  }
}

function switchLoginTab(tab) {
  const userTab = document.getElementById('login-tab-user');
  const adminTab = document.getElementById('login-tab-admin');
  const userPane = document.getElementById('login-pane-user');
  const adminPane = document.getElementById('login-pane-admin');
  if (!userTab || !adminTab || !userPane || !adminPane) return;
  if (tab === 'user') {
    userTab.classList.add('active');
    adminTab.classList.remove('active');
    userPane.style.display = 'block';
    adminPane.style.display = 'none';
  } else {
    adminTab.classList.add('active');
    userTab.classList.remove('active');
    adminPane.style.display = 'block';
    userPane.style.display = 'none';
  }
}

function checkAdminSession() {
  const session = sessionStorage.getItem('vx_admin');
  if (session === 'true') {
    adminLoggedIn = true;
  }
  updateAdminUI();
  if (adminLoggedIn) {
    renderProductGrids();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function submitAdminLogin() {
  const input = document.getElementById('admin-key-input');
  if (!input) return;
  const key = input.value.trim();
  if (ADMIN_CONFIG.mode === 'local') {
    if (key === ADMIN_CONFIG.secretKey) {
      adminLoggedIn = true;
      sessionStorage.setItem('vx_admin', 'true');
      closeLoginModal(null, true);
      updateAdminUI();
      renderProductGrids();
      if (typeof lucide !== 'undefined') lucide.createIcons();
      showToast('? Modo admin ativado! Bem-vindo, dono(a)!');
    } else {
      input.style.borderColor = '#ef4444';
      input.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.2)';
      setTimeout(() => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
      }, 1500);
      showToast('? Senha incorreta. Tente novamente.');
    }
  }
}

function logoutAdmin() {
  adminLoggedIn = false;
  sessionStorage.removeItem('vx_admin');
  updateAdminUI();
  renderProductGrids();
  if (typeof lucide !== 'undefined') lucide.createIcons();
  showToast('Saiu do modo admin.');
}

function updateAdminUI() {
  const btn = document.getElementById('btn-entrar');
  const fab = document.getElementById('admin-fab');
  const adminBar = document.getElementById('admin-bar');
  if (adminLoggedIn) {
    if (btn) {
      btn.innerHTML = '<i data-lucide="shield-check" style="width:1.1rem;height:1.1rem;color:#02e2ff;"></i><span class="hide-mobile" style="color:#02e2ff;">Admin</span>';
      btn.onclick = logoutAdmin;
      btn.title = 'Clique para sair do admin';
    }
    if (fab) fab.style.display = 'flex';
    if (adminBar) adminBar.style.display = 'flex';
  } else {
    if (btn) {
      btn.innerHTML = '<i data-lucide="user" style="width:1.1rem;height:1.1rem;"></i><span class="hide-mobile">Entrar</span>';
      btn.onclick = openLoginModal;
      btn.title = '';
    }
    if (fab) fab.style.display = 'none';
    if (adminBar) adminBar.style.display = 'none';
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function populateAdminCategoryOptions() {
  const select = document.getElementById('ap-category');
  if (!select) return;
  const currentValue = select.value;
  select.innerHTML = '';
  CATEGORY_LIST.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    select.appendChild(option);
  });
  if (currentValue) {
    select.value = currentValue;
  }
}

function openAdminProductModal(productId, presetCategory) {
  if (!adminLoggedIn) return;
  populateAdminCategoryOptions();
  adminEditingProductId = productId || null;
  const modal = document.getElementById('admin-product-modal');
  const title = document.getElementById('ap-modal-title');
  const form = document.getElementById('admin-product-form');
  if (!modal || !form || !title) return;
  form.reset();
  const removeButton = document.getElementById('ap-remove-button');

  if (productId !== null && productId !== undefined) {
    const product = products.find((p) => p.id === productId);
    if (product) {
      title.textContent = 'Editar Produto';
      document.getElementById('ap-name').value = product.name;
      document.getElementById('ap-category').value = product.category;
      document.getElementById('ap-orig-price').value = product.originalPrice;
      document.getElementById('ap-price').value = product.price;
      document.getElementById('ap-color').value = product.svgClass;
      document.getElementById('ap-image').value = product.image || '';
      if (removeButton) removeButton.style.display = 'inline-flex';
    }
  } else {
    title.textContent = 'Adicionar Produto';
    if (presetCategory) document.getElementById('ap-category').value = presetCategory;
    if (removeButton) removeButton.style.display = 'none';
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAdminProductModal() {
  const modal = document.getElementById('admin-product-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  adminEditingProductId = null;
}

function saveAdminProduct(event) {
  event.preventDefault();
  if (!adminLoggedIn) return;
  const name = document.getElementById('ap-name').value.trim();
  const category = document.getElementById('ap-category').value;
  const categoryName = document.getElementById('ap-category').options[document.getElementById('ap-category').selectedIndex].text;
  const origPrice = parseFloat(document.getElementById('ap-orig-price').value);
  const price = parseFloat(document.getElementById('ap-price').value);
  const svgClass = document.getElementById('ap-color').value;
  const image = document.getElementById('ap-image').value.trim();
  if (!name || isNaN(origPrice) || isNaN(price) || origPrice <= 0 || price <= 0) {
    showToast('Preencha todos os campos corretamente.');
    return;
  }
  if (adminEditingProductId !== null) {
    const idx = products.findIndex((p) => p.id === adminEditingProductId);
    if (idx !== -1) {
      products[idx] = { ...products[idx], name, category, categoryName, originalPrice: origPrice, price, svgClass, svgContent: '', image };
    }
    showToast('? Produto atualizado!');
  } else {
    products.push({ id: getNextProductId(), category, categoryName, name, originalPrice: origPrice, price, svgClass, svgContent: '', image });
    showToast('? Produto adicionado!');
  }
  saveProducts();
  closeAdminProductModal();
  renderProductGrids();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function removeAdminProduct() {
  if (!adminLoggedIn || adminEditingProductId === null) return;
  if (!confirm('Tem certeza que deseja remover este produto?')) return;
  products = products.filter((product) => product.id !== adminEditingProductId);
  cart = cart.filter((item) => item.id !== adminEditingProductId);
  saveProducts();
  saveCart();
  showToast('Produto removido com sucesso.');
  closeAdminProductModal();
  renderProductGrids();
  updateCartUI();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function deleteProduct(productId) {
  if (!adminLoggedIn) return;
  if (!confirm('Tem certeza que deseja remover este produto?')) return;
  products = products.filter((product) => product.id !== productId);
  cart = cart.filter((item) => item.id !== productId);
  saveProducts();
  saveCart();
  showToast('Produto removido com sucesso.');
  renderProductGrids();
  updateCartUI();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function loadPixConfig() {
  const saved = localStorage.getItem('sitevoltrix_pix_config');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { return null; }
  }
  return null;
}

function savePixConfigToStorage(config) {
  localStorage.setItem('sitevoltrix_pix_config', JSON.stringify(config));
}

function openPixConfigModal() {
  if (!adminLoggedIn) return;
  const modal = document.getElementById('pix-config-modal');
  if (!modal) return;
  const config = loadPixConfig();
  const tipoSelect = document.getElementById('pix-tipo');
  const chaveInput = document.getElementById('pix-chave');
  const nomeInput = document.getElementById('pix-nome');
  const cidadeInput = document.getElementById('pix-cidade');
  const statusBox = document.getElementById('pix-status-box');
  const statusText = document.getElementById('pix-status-text');
  const removeBtn = document.getElementById('pix-remove-btn');
  if (config) {
    if (tipoSelect) tipoSelect.value = config.tipo || 'cpf';
    if (chaveInput) chaveInput.value = config.chave || '';
    if (nomeInput) nomeInput.value = config.nome || '';
    if (cidadeInput) cidadeInput.value = config.cidade || 'Sao Paulo';
    if (statusBox && config.chave) {
      statusBox.style.display = 'flex';
      const tipoLabel = { cpf: 'CPF', cnpj: 'CNPJ', email: 'E-mail', telefone: 'Telefone', aleatoria: 'Chave Aleatória' };
      if (statusText) statusText.textContent = 'Chave ' + (tipoLabel[config.tipo] || 'Pix') + ' configurada: ' + maskPixKey(config.chave, config.tipo);
    }
    if (removeBtn) removeBtn.style.display = 'flex';
    // populate optional QR image and payload fields
    const qrUrlInput = document.getElementById('pix-qr-url');
    const payloadInput = document.getElementById('pix-payload');
    const qrPreview = document.getElementById('pix-qr-preview');
    const qrPreviewImg = document.getElementById('pix-qr-preview-img');
    if (qrUrlInput) qrUrlInput.value = config.qrImageUrl || '';
    if (payloadInput) payloadInput.value = config.payload || '';
    if (config.qrImageUrl) {
      pixUploadedDataUrl = null; // prefer stored url unless user uploads
      if (qrPreview && qrPreviewImg) {
        qrPreviewImg.src = config.qrImageUrl;
        qrPreview.style.display = 'block';
      }
    } else if (qrPreview && qrPreviewImg) {
      qrPreview.style.display = 'none';
      qrPreviewImg.src = '';
    }
  } else {
    if (statusBox) statusBox.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'none';
    const form = document.getElementById('pix-config-form');
    if (form) form.reset();
  }
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('active'));
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closePixConfigModal() {
  const modal = document.getElementById('pix-config-modal');
  if (!modal) return;
  modal.classList.remove('active');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function handlePixFileSelect(event) {
  const file = event && event.target && event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    pixUploadedDataUrl = e.target.result;
    const qrPreview = document.getElementById('pix-qr-preview');
    const qrPreviewImg = document.getElementById('pix-qr-preview-img');
    if (qrPreview && qrPreviewImg) {
      qrPreviewImg.src = pixUploadedDataUrl;
      qrPreview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

function savePixConfig(event) {
  if (event) event.preventDefault();
  if (!adminLoggedIn) return;
  const tipo = document.getElementById('pix-tipo').value;
  const chave = document.getElementById('pix-chave').value.trim();
  const nome = document.getElementById('pix-nome').value.trim();
  const cidade = document.getElementById('pix-cidade').value.trim() || 'Sao Paulo';
  const qrUrl = document.getElementById('pix-qr-url') ? document.getElementById('pix-qr-url').value.trim() : '';
  const payload = document.getElementById('pix-payload') ? document.getElementById('pix-payload').value.trim() : '';
  if (!chave || !nome) {
    showToast('Preencha a chave Pix e o nome do titular.');
    return;
  }
  const config = { tipo, chave, nome, cidade, qrImageUrl: qrUrl, payload };
  // if user uploaded an image, prefer that (data URL)
  if (pixUploadedDataUrl) {
    config.qrImageUrl = pixUploadedDataUrl;
  }
  savePixConfigToStorage(config);
  pixConfig = config;
  updatePixCopyPaste();
  showToast('Chave Pix salva com sucesso! Os pagamentos agora vão para sua conta.');
  closePixConfigModal();
}

function removePixConfig() {
  if (!adminLoggedIn) return;
  if (!confirm('Tem certeza que deseja remover a chave Pix?')) return;
  localStorage.removeItem('sitevoltrix_pix_config');
  pixConfig = null;
  pixUploadedDataUrl = null;
  updatePixCopyPaste();
  showToast('Chave Pix removida.');
  closePixConfigModal();
}

function maskPixKey(chave, tipo) {
  if (!chave) return '***';
  if (tipo === 'cpf' && chave.length >= 6) {
    return `${chave.substring(0, 3)}.***.***-${chave.slice(-2)}`;
  }
  if (tipo === 'email' && chave.includes('@')) {
    const parts = chave.split('@');
    return `${parts[0].substring(0, 2)}***@${parts[1]}`;
  }
  if (tipo === 'telefone' && chave.length >= 6) {
    return `${chave.substring(0, 4)}****${chave.slice(-2)}`;
  }
  if (chave.length > 8) {
    return `${chave.substring(0, 4)}****${chave.slice(chave.length - 4)}`;
  }
  return `${chave.substring(0, 3)}***`;
}

function generatePixCode(chave, nome, cidade, valor) {
  function tlv(id, value) {
    const len = String(value.length).padStart(2, '0');
    return id + len + value;
  }
  let payload = '';
  payload += tlv('00', '01');
  payload += tlv('01', '12');
  const gui = tlv('00', 'br.gov.bcb.pix');
  const key = tlv('01', chave);
  payload += tlv('26', gui + key);
  payload += tlv('52', '0000');
  payload += tlv('53', '986');
  if (valor > 0) {
    payload += tlv('54', valor.toFixed(2));
  }
  payload += tlv('58', 'BR');
  const nomeClean = nome.substring(0, 25).replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
  payload += tlv('59', nomeClean);
  const cidadeClean = cidade.substring(0, 15).replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
  payload += tlv('60', cidadeClean);
  payload += tlv('62', tlv('05', '***'));
  payload += '6304';
  payload += crc16CCITT(payload);
  return payload;
}

function crc16CCITT(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function openRoletaModal() {
  const modal = document.getElementById('roleta-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeRoletaModal() {
  const modal = document.getElementById('roleta-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function openFeedbackModal() {
  const modal = document.getElementById('feedback-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeFeedbackModal() {
  const modal = document.getElementById('feedback-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function showToast(message) {
  if (typeof Toastify !== 'undefined') {
    Toastify({
      text: message,
      duration: 3000,
      gravity: 'top',
      position: 'right',
      style: {
        background: 'linear-gradient(to right, #7c3aed, #4f46e5)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        fontFamily: "'Geist', sans-serif",
        fontSize: '0.85rem',
        fontWeight: '600'
      }
    }).showToast();
  } else {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.background = '#7c3aed';
    toast.style.color = 'white';
    toast.style.padding = '0.75rem 1.25rem';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.fontWeight = 'bold';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}
