 // Logic for VOLTRIX STORE
 
 // 1. Products Data
 const products = [
   // Adicione seus produtos aqui seguindo o formato:
   // {
   //   id: 1,
   //   category: 'contas_codiguim',  // ou: 'sensi_painel', 'assinaturas', 'valorant', 'jogos_steam'
   //   name: 'Nome do Produto',
   //   originalPrice: 100.00,
   //   price: 49.90,
   //   image: 'assets/imagem.png',
   //   svgClass: 'purple',  // cores: 'purple', 'blue', 'red', 'green', 'orange', 'amber'
   //   svgContent: '<svg>...</svg>',
   //   categoryName: 'Nome da Categoria'
   // }
 ];
 
 // 2. State Management
 let cart = [];
 let appliedCoupon = null;
 let couponsList = {
   'VX10': 0.10,     // 10% OFF
   'VX20': 0.20,     // 20% OFF
   'SENSI50': 0.50,  // 50% OFF
   'VX5': 0.05,      // 5% OFF
   'VX15': 0.15      // 15% OFF
 };
 
 // Checkout state
 let currentStep = 1;
 let userData = { name: '', email: '', whatsapp: '' };
 let checkPaymentInterval = null;
 
 // Initialize App
 document.addEventListener('DOMContentLoaded', () => {
   // Load Cart from localStorage
   const savedCart = localStorage.getItem('sitevoltrix_cart');
   if (savedCart) {
     try {
       cart = JSON.parse(savedCart);
       updateCartUI();
     } catch (e) {
       cart = [];
     }
   }
 
   // Render Product Grids
   renderProductGrids();
 
   // Load Lucide Icons
   if (typeof lucide !== 'undefined') {
     lucide.createIcons();
   }
 
   // Set up Event Listeners
   setupEventLis
           </svg>
           <div class="pix-copiacola-container">
             <div class="pix-key-text" id="pix-key-val">Carregando cÃ³digo Pix...</div>
             <button class="pix-copy-btn" onclick="copyPixKey()">Copiar</button>
           </div>
           <p class="pix-timer">Aguardando confirmaÃ§Ã£o do pagamento... Expira em: <span class="pix-timer-count" id="pix-timer-val">10:00</span></p>
           <p style="font-size: 0.8rem; color: #a3a3a3; font-style: italic;">(AprovaÃ§Ã£o simulada em 9 segundos para demonstraÃ§Ã£o)</p>
         </div>
       `;
     }
   }, 400);
 }
 
 // 6. Utility Toast Function
 function showToast(message) {
   if (typeof Toastify !== 'undefined') {
     Toastify({
       text: message,
       duration: 3000,
       gravity: 'top', // `top` or `bottom`
       position: 'right', // `left`, `center` or `right`
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
     // Fallback if toastify fails
     const toast = document.createElement('div');
     toast.textContent = message;
     toast.style.position = 'fixed';
     toast.style.bottom = '2rem';
     toast.style.left = '2rem';
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
 
