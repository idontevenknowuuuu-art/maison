let currentUser = null;
let PRODUCTS = [];
let supabaseClient = null;

const CATEGORIES = [
  {id:'living',name:'Living Room',count:142,cat:'sofa',img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80'},
  {id:'bedroom',name:'Bedroom',count:98,cat:'bed',img:'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80'},
  {id:'dining',name:'Dining',count:67,cat:'table',img:'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80'},
  {id:'office',name:'Home Office',count:54,cat:'chair',img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80'},
  {id:'outdoor',name:'Outdoor',count:43,cat:'all',img:'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=600&q=80'}
];

// Hardcoded fallback products so the page ALWAYS renders even without Supabase
const FALLBACK_PRODUCTS = [
  {id:1,name:'Velvet Sofa',price:2499,oldPrice:2999,category:'Living Room',cat:'sofa',badge:'Best Seller',desc:'Premium velvet sofa with solid walnut legs.',img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'},
  {id:2,name:'Leather Armchair',price:1299,oldPrice:null,category:'Living Room',cat:'sofa',badge:'',desc:'Italian leather armchair with ergonomic design.',img:'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80'},
  {id:3,name:'Coffee Table',price:899,oldPrice:1099,category:'Living Room',cat:'sofa',badge:'Sale',desc:'Solid oak coffee table with tempered glass top.',img:'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=600&q=80'},
  {id:4,name:'Floor Lamp',price:449,oldPrice:null,category:'Living Room',cat:'sofa',badge:'',desc:'Brass floor lamp with linen shade.',img:'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&q=80'},
  {id:5,name:'Bookshelf',price:1899,oldPrice:null,category:'Living Room',cat:'sofa',badge:'New',desc:'5-tier walnut bookshelf with adjustable shelves.',img:'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&q=80'},
  {id:6,name:'TV Console',price:1399,oldPrice:1699,category:'Living Room',cat:'sofa',badge:'Sale',desc:'Media console with cable management system.',img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80'},
  {id:7,name:'Platform Bed',price:2199,oldPrice:null,category:'Bedroom',cat:'bed',badge:'Best Seller',desc:'King-size platform bed in solid walnut.',img:'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80'},
  {id:8,name:'Nightstand',price:599,oldPrice:null,category:'Bedroom',cat:'bed',badge:'',desc:'Minimalist nightstand with soft-close drawer.',img:'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80'},
  {id:9,name:'Dresser',price:1799,oldPrice:2099,category:'Bedroom',cat:'bed',badge:'Sale',desc:'6-drawer dresser in white oak finish.',img:'https://images.unsplash.com/photo-1551298370-9d3d53bc4f96?w=600&q=80'},
  {id:10,name:'Wardrobe',price:2899,oldPrice:null,category:'Bedroom',cat:'bed',badge:'New',desc:'Full-length mirrored wardrobe with interior lighting.',img:'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80'},
  {id:11,name:'Dining Table',price:2699,oldPrice:null,category:'Dining',cat:'table',badge:'Best Seller',desc:'Extendable dining table seats 6-10.',img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80'},
  {id:12,name:'Dining Chairs (Set of 4)',price:1499,oldPrice:1899,category:'Dining',cat:'table',badge:'Sale',desc:'Upholstered dining chairs with walnut frame.',img:'https://images.unsplash.com/photo-1549497538-303791108f95?w=600&q=80'},
  {id:13,name:'Sideboard',price:1999,oldPrice:null,category:'Dining',cat:'table',badge:'',desc:'Mid-century sideboard with ample storage.',img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'},
  {id:14,name:'Bar Cart',price:799,oldPrice:null,category:'Dining',cat:'table',badge:'New',desc:'Gold-finished bar cart with marble shelf.',img:'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80'}
];

// Try to initialize Supabase, but don't crash if it fails
try {
  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(
      'https://yfyjjxvzhmjoyfikidrg.supabase.co',
      'sb_publishable_lYGIsCSrd0QmRyQfITDD_g_mVBn7_Mu'
    );
    console.log('✅ Supabase client initialized');
  } else {
    console.warn('⚠️ Supabase SDK not loaded – running in offline/demo mode');
  }
} catch(e) {
  console.warn('⚠️ Supabase init failed – running in offline/demo mode:', e.message);
  supabaseClient = null;
}

async function loadProducts() {
  // Try Supabase first
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('products').select('*').order('id', { ascending: true });
      if (data && data.length > 0) {
        PRODUCTS = data;
        renderProducts();
        console.log('✅ Products loaded from Supabase:', data.length);
        return;
      }
    } catch(e) {
      console.warn('⚠️ Supabase products fetch failed:', e.message);
    }
  }
  // Fallback to hardcoded products
  console.log('ℹ️ Using fallback product data');
  PRODUCTS = FALLBACK_PRODUCTS;
  renderProducts();
}

function renderProducts() {
  const grids = ['living', 'bedroom', 'dining'];
  grids.forEach(cat => {
    const el = document.getElementById(cat + 'Grid');
    if (!el) return;
    const catProducts = PRODUCTS.filter(p => p.cat === cat || (cat === 'living' && p.cat === 'sofa') || (cat === 'bedroom' && p.cat === 'bed') || (cat === 'dining' && p.cat === 'table'));
    el.innerHTML = catProducts.map(p => `
      <div class="product-card" onclick="openProductModal(${p.id})">
        <div class="product-img-wrap">
          ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
          <img class="product-img" src="${p.img}" alt="${p.name}">
          <div class="product-hover">
            <button class="hover-btn" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-cat">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-price">
            $${p.price}
            ${p.oldPrice ? `<span class="product-old-price">$${p.oldPrice}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// CART LOGIC
function getCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }
function addToCart(id) {
  let cart = getCart();
  let item = PRODUCTS.find(p => p.id == id);
  if(!item) return;
  let existing = cart.find(c => c.id == id);
  if (existing) existing.qty += 1;
  else cart.push({...item, qty: 1});
  saveCart(cart);
  updateCartBadge();
  showToast('✅ Added to Cart');
}
function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(c => c.id != id);
  saveCart(cart);
  updateCartBadge();
  renderCart();
}
function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((acc, c) => acc + c.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}
function renderCart() {
  const cart = getCart();
  const cartItems = document.getElementById('cartItemsContainer');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTotal = document.getElementById('cartTotal');
  const cartFooter = document.getElementById('cartFooter');
  const cartCountLabel = document.getElementById('cartCountLabel');
  if (!cartItems) return;
  if (cartCountLabel) cartCountLabel.textContent = cart.reduce((a,c)=>a+c.qty,0) + ' items';
  if (!cart.length) {
    cartItems.innerHTML = '<div style="text-align:center;padding:2rem;">Your cart is empty.</div>';
    if(cartFooter) cartFooter.style.display = 'none';
    return;
  }
  if(cartFooter) cartFooter.style.display = 'block';
  let sub = 0;
  cartItems.innerHTML = cart.map(c => {
    sub += c.price * c.qty;
    return `
      <div class="cart-item">
        <img src="${c.img}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name">${c.name}</div>
          <div class="cart-item-price">$${c.price}</div>
          <div style="font-size:0.8rem; margin-top:0.5rem; color:var(--warm-gray);">Qty: ${c.qty}</div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${c.id})">✕</button>
      </div>
    `;
  }).join('');
  
  if (cartSubtotal) cartSubtotal.textContent = '$' + sub;
  if (cartTotal) cartTotal.textContent = '$' + (sub >= 500 ? sub : sub + 99);
}
function openCart() {
  const sidebar = document.getElementById('cartSidebar');
  const backdrop = document.getElementById('cartBackdrop');
  if (sidebar) sidebar.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  renderCart();
}
function closeCart() {
  const sidebar = document.getElementById('cartSidebar');
  const backdrop = document.getElementById('cartBackdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
}

// MODALS
function openProductModal(id) {
  const p = PRODUCTS.find(x => x.id == id);
  if(!p) return;
  const m = document.getElementById('productModal');
  if(!m) return;
  const mainImg = document.getElementById('pmMainImg');
  if(mainImg) mainImg.src = p.img;
  const body = document.getElementById('pmBody');
  if(body) {
    body.innerHTML = `
      ${p.badge ? `<div class="pm-badge" style="display:inline-block;background:var(--gold);color:var(--charcoal);font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:0.35rem 0.8rem;margin-bottom:1rem;">${p.badge}</div>` : ''}
      <div class="pm-category" style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--warm-gray);margin-bottom:0.5rem;">${p.category}</div>
      <h2 style="font-family:var(--font-display);font-size:2rem;font-weight:400;margin-bottom:0.8rem;">${p.name}</h2>
      <div style="font-size:1.4rem;font-weight:600;color:var(--walnut);margin-bottom:1.2rem;">$${p.price}${p.oldPrice ? ` <span style="text-decoration:line-through;color:var(--warm-gray);font-size:1rem;font-weight:400;">$${p.oldPrice}</span>` : ''}</div>
      <p style="color:var(--warm-gray);line-height:1.7;margin-bottom:2rem;">${p.desc}</p>
      <button onclick="addToCart(${p.id}); closeProductModal();" style="width:100%;padding:1rem;background:var(--walnut);color:var(--white);border:none;font-family:var(--font-body);font-size:0.85rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:background 0.3s;">Add to Cart</button>
    `;
  }
  m.classList.add('show');
}
function closeProductModal() {
  const m = document.getElementById('productModal');
  if(m) m.classList.remove('show');
}
function openAuth(tab) {
  const m = document.getElementById('authOverlay');
  if(m) m.classList.add('show');
  switchAuthTab(tab || 'login');
}
function closeAuth() {
  const m = document.getElementById('authOverlay');
  if(m) m.classList.remove('show');
}
function switchAuthTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
  document.getElementById('panelLogin').classList.toggle('active', tab === 'login');
  document.getElementById('panelSignup').classList.toggle('active', tab === 'signup');
}
const switchTab = switchAuthTab;

function scrollToSection(id) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({behavior:'smooth'});
}
function subscribeNewsletter() {
  const e = document.getElementById('nlEmail');
  if(e && e.value) { showToast('Thanks for subscribing!'); e.value=''; }
}

// SUPABASE AUTH (only if Supabase is available)
if (supabaseClient) {
  try {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session) {
        currentUser = session.user;
        supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single().then(({data}) => {
          if(data) {
            currentUser.profile = data;
            updateAuthUI();
            updateCartBadge();
          }
        });
      } else {
        currentUser = null;
        updateAuthUI();
        updateCartBadge();
      }
    });
  } catch(e) {
    console.warn('⚠️ Auth listener failed:', e.message);
  }
}

async function handleLogin(){
  const email=document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass=document.getElementById('loginPassword').value;
  if(!email||!pass){showToast('⚠️ Please fill in all fields');return;}
  if(!supabaseClient){showToast('⚠️ Database not connected. Please use a local server.');return;}
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
  if (error) { showToast('⚠️ ' + error.message); return; }
  closeAuth();
  showToast('👋 Welcome back!');
}

async function handleSignup(){
  const first=document.getElementById('signupFirst').value.trim();
  const last=document.getElementById('signupLast').value.trim();
  const email=document.getElementById('signupEmail').value.trim().toLowerCase();
  const phone=document.getElementById('signupPhone').value.trim();
  const pass=document.getElementById('signupPassword').value;
  const confirm=document.getElementById('signupConfirm').value;
  if(!first||!email||!pass){showToast('⚠️ Fill all required fields');return;}
  if(pass!==confirm){showToast('⚠️ Passwords do not match');return;}
  if(!supabaseClient){showToast('⚠️ Database not connected. Please use a local server.');return;}
  
  const { data, error } = await supabaseClient.auth.signUp({
    email, password: pass,
    options: { data: { name: first + ' ' + last, phone } }
  });
  if (error) { showToast('⚠️ ' + error.message); return; }
  closeAuth();
  showToast('🎉 Account created successfully!');
}

async function handleLogout(){
  if(supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  currentUser = null;
  updateAuthUI();
  const drop = document.getElementById('userDropdown');
  if(drop) drop.classList.remove('show');
  showToast('👋 Signed out successfully');
}

function updateAuthUI(){
  const btn=document.getElementById('authBtn');
  const menu=document.getElementById('userMenu');
  const av=document.getElementById('userAvatar');
  if(currentUser && currentUser.profile){
    if(btn) btn.style.display='none';
    if(menu) menu.style.display='';
    if(av) {
      av.textContent = currentUser.profile.name ? currentUser.profile.name[0].toUpperCase() : 'U';
    }
  } else {
    if(btn) btn.style.display='';
    if(menu) menu.style.display='none';
  }
}

function toggleUserDropdown(){
  const d=document.getElementById('userDropdown');
  if(d) d.style.display = d.style.display==='block' ? 'none' : 'block';
}

// CHECKOUT — sends email to admin + customer
async function placeOrder(){
  if(!currentUser){openAuth('login'); showToast('⚠️ Please sign in to place an order'); return;}
  const cart=getCart();
  if(!cart.length){showToast('⚠️ Your cart is empty!');return;}
  
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const ship=sub>=500?0:99;
  const total=sub+ship;
  const orderId='MSN-'+Date.now();
  
  const order={
    id: orderId,
    user_id: currentUser.id,
    date: new Date().toLocaleString(),
    items: cart,
    subtotal: sub,
    shipping: ship,
    total: total,
    status: 'Processing',
    customer: {
      name: currentUser.profile?.name || 'Customer',
      email: currentUser.email,
      phone: currentUser.profile?.phone || ''
    }
  };
  
  // Save to Supabase if available
  if(supabaseClient) {
    try {
      const { error } = await supabaseClient.from('orders').insert([order]);
      if (error) console.warn('Supabase order save error:', error.message);
    } catch(e) {
      console.warn('Could not save to Supabase:', e.message);
    }
  }
  
  // Send order emails via server
  try {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const result = await res.json();
    if (!result.success) {
      showToast('⚠️ Order placed but email failed: ' + (result.error || 'Unknown error'));
    } else {
      if(result.adminPreview) console.log('Admin Email:', result.adminPreview);
      if(result.customerPreview) console.log('Customer Email:', result.customerPreview);
    }
  } catch(e) {
    console.warn('Email send error:', e.message);
  }
  
  saveCart([]);
  updateCartBadge();
  renderCart();
  closeCart();
  
  showToast('✅ Order #' + orderId.slice(-6) + ' placed! Confirmation emails sent.');
}

// DASHBOARD
async function showDashTab(tab){
  ['profile','orders','wishlist'].forEach(t=>{
    const btn=document.getElementById('dtab-'+t);
    if(btn)btn.style.cssText+=(t===tab?';color:var(--walnut);border-bottom-color:var(--gold)':';color:var(--warm-gray);border-bottom-color:transparent');
  });
  const c=document.getElementById('dashContent');
  if(!c) return;
  
  if(tab==='profile'){
    c.innerHTML=`
      <h3 style="font-family:var(--font-display);font-size:1.8rem;margin-bottom:1.5rem;">My Profile</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
        <div style="background:var(--cream);padding:1.2rem;border-radius:4px;">
          <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--warm-gray);font-weight:600;margin-bottom:0.3rem;">Full Name</div>
          <div style="font-weight:600;">${currentUser.profile?.name||'N/A'}</div>
        </div>
        <div style="background:var(--cream);padding:1.2rem;border-radius:4px;">
          <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--warm-gray);font-weight:600;margin-bottom:0.3rem;">Email</div>
          <div style="font-weight:600;">${currentUser.email||'N/A'}</div>
        </div>
      </div>`;
  } else if(tab==='orders'){
    if(supabaseClient) {
      try {
        const { data: userOrders } = await supabaseClient.from('orders').select('*').eq('user_id', currentUser.id).order('date', { ascending: false });
        if(!userOrders || !userOrders.length){
          c.innerHTML=`<div style="text-align:center;padding:3rem;">No orders yet.</div>`;
          return;
        }
        c.innerHTML=`<h3 style="font-family:var(--font-display);font-size:1.8rem;margin-bottom:1.5rem;">My Orders</h3>
          ${userOrders.map(o=>`
            <div style="border:1px solid var(--sand);border-radius:4px;margin-bottom:1rem;padding:1rem;">
              <strong>Order ${o.id}</strong> - $${o.total} - ${o.status}
            </div>`).join('')}`;
      } catch(e) {
        c.innerHTML=`<div style="text-align:center;padding:3rem;">Could not load orders.</div>`;
      }
    } else {
      c.innerHTML=`<div style="text-align:center;padding:3rem;">Orders require database connection.</div>`;
    }
  } else if(tab==='wishlist'){
     c.innerHTML=`<div style="text-align:center;padding:3rem;">Wishlist coming soon.</div>`;
  }
}

function openDashboard(tab){
  if(!currentUser){openAuth('login');return;}
  const m = document.getElementById('dashModal');
  if(m) {
    m.style.display='block';
    document.body.style.overflow='hidden';
    const g = document.getElementById('dashGreeting');
    if(g) g.textContent='Welcome back, '+(currentUser.profile?.name?.split(' ')[0]||'User');
    showDashTab(tab||'profile');
  }
}
function closeDashboard(){
  const m = document.getElementById('dashModal');
  if(m) m.style.display='none';
  document.body.style.overflow='';
}

// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if(nav) nav.classList.toggle('scrolled', window.scrollY > 100);
  const scrollBtn = document.getElementById('scrollTop');
  if(scrollBtn) scrollBtn.classList.toggle('show', window.scrollY > 600);
});

// Hamburger menu
function toggleMenu() {
  const links = document.querySelector('.nav-links');
  if(links) links.classList.toggle('open');
}

window.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loadingScreen');
  if (loading) setTimeout(() => loading.classList.add('hidden'), 2500);
  loadProducts();
  updateCartBadge();
});
