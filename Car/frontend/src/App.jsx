import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, ShoppingBag, LogOut, Search, PlusCircle, 
  Settings, User, ChevronRight, X, Check, Filter, XCircle
} from 'lucide-react';
import { 
  fetchCars, loginUser, signupUser, 
  fetchCart, addToCart, removeCartItem, addCarListing, checkoutCart 
} from './api';

export default function App() {
  const [cars, setCars] = useState([]);
  const [filters, setFilters] = useState({ makes: [], styles: [], years: [], conditions: [] });
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || '');
  
  const [cart, setCart] = useState({ items: [], total_prebooking_price: 0 });
  
  // Auth screen states: 'login', 'signup', 'forgot'
  const [authMode, setAuthMode] = useState('login'); 
  
  // Modal states (only for logged-in users): 'add_car', 'cart', 'detail'
  const [activeModal, setActiveModal] = useState(null); 
  const [selectedCar, setSelectedCar] = useState(null);

  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '', first_name: '', last_name: '', confirm_password: '' });
  const [newCarForm, setNewCarForm] = useState({ make: '', model: '', year: '', style: '', condition: 'New', mileage: '', horsepower: '', price: '', desc: '' });
  const [carImage, setCarImage] = useState(null);
  const [message, setMessage] = useState(null);

  // Initialize
  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      loadData(token);
    }
  }, []);

  const loadData = async (activeToken) => {
    try {
      const data = await fetchCars({ make: selectedMake, style: selectedStyle, search: searchQuery });
      setCars(data.cars || []);
      if (data.filters) setFilters(data.filters);
      
      const cartData = await fetchCart(activeToken);
      setCart(cartData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if(token) {
      try {
        const data = await fetchCars({ make: selectedMake, style: selectedStyle, search: searchQuery });
        setCars(data.cars || []);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      let data;
      if (authMode === 'login') {
        data = await loginUser(authForm.username, authForm.password);
      } else if (authMode === 'signup') {
        if (authForm.password !== authForm.confirm_password) {
          throw new Error('Passwords do not match');
        }
        data = await signupUser(authForm);
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      loadData(data.token);
      setMessage({ type: 'success', text: `Welcome to Carversal, ${data.user.username}.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    setAuthMode('login');
  };

  const handleAddToCart = async (carId) => {
    try {
      await addToCart(token, carId);
      const cartData = await fetchCart(token);
      setCart(cartData);
      
      // Update cars list to reflect reservation
      const data = await fetchCars({ make: selectedMake, style: selectedStyle, search: searchQuery });
      setCars(data.cars || []);
      
      setMessage({ type: 'success', text: 'Vehicle added to reservations.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await removeCartItem(token, itemId);
      const cartData = await fetchCart(token);
      setCart(cartData);

      // Update cars list to reflect cancellation
      const data = await fetchCars({ make: selectedMake, style: selectedStyle, search: searchQuery });
      setCars(data.cars || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCheckout = async () => {
    try {
      await checkoutCart(token);
      
      const cartData = await fetchCart(token);
      setCart(cartData);

      const data = await fetchCars({ make: selectedMake, style: selectedStyle, search: searchQuery });
      setCars(data.cars || []);

      setActiveModal(null);
      setMessage({ type: 'success', text: 'Checkout complete. Reservation confirmation email sent.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAddCarSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newCarForm).forEach(key => formData.append(key, newCarForm[key]));
    if (carImage) formData.append('image', carImage);

    try {
      await addCarListing(token, formData);
      setActiveModal(null);
      const data = await fetchCars();
      setCars(data.cars || []);
      setMessage({ type: 'success', text: 'Vehicle added to inventory.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // -------------------------------------------------------------
  // RENDER AUTH WALL IF NOT LOGGED IN
  // -------------------------------------------------------------
  if (!user || !token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div className="bg-image-layer"></div>
        <div className="auth-bg-overlay"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="luxury-panel" 
          style={{ width: '100%', maxWidth: '480px', padding: '48px', margin: '20px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="title-serif" style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--accent-gold)' }}>CARVERSAL</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Exclusive Hypercar Showroom</p>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            
              <>
                <input type="text" className="input-luxury" placeholder="Username" required value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
                
                {authMode === 'signup' && (
                  <>
                    <input type="email" className="input-luxury" placeholder="Email Address" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <input type="text" className="input-luxury" placeholder="First Name" value={authForm.first_name} onChange={e => setAuthForm({...authForm, first_name: e.target.value})} />
                      <input type="text" className="input-luxury" placeholder="Last Name" value={authForm.last_name} onChange={e => setAuthForm({...authForm, last_name: e.target.value})} />
                    </div>
                  </>
                )}

                <input type="password" className="input-luxury" placeholder="Password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
                
                {authMode === 'signup' && (
                  <input type="password" className="input-luxury" placeholder="Confirm Password" required value={authForm.confirm_password} onChange={e => setAuthForm({...authForm, confirm_password: e.target.value})} />
                )}
              </>
            

            <button type="submit" className="btn-gold" style={{ marginTop: '10px' }}>
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            {authMode === 'login' && (
              <>
                Don't have an account? <button onClick={() => setAuthMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontWeight: 'bold' }}>Register</button>
              </>
            )}
            {authMode === 'signup' && (
              <>Already have an account? <button onClick={() => setAuthMode('login')} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontWeight: 'bold' }}>Sign In</button></>
            )}
          </div>
        </motion.div>

        {/* Auth Error Toasts */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{ position: 'absolute', top: '40px', background: 'rgba(0,0,0,0.8)', border: `1px solid ${message.type === 'error' ? '#ef4444' : 'var(--accent-gold)'}`, color: '#fff', padding: '16px 24px', borderRadius: '4px', zIndex: 100 }}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER MAIN DASHBOARD (LOGGED IN)
  // -------------------------------------------------------------
  const cartItemCount = cart.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="bg-image-layer"></div>
      <div className="bg-image-overlay"></div>

      {/* Navbar */}
      <nav className="luxury-nav" style={{ position: 'sticky', top: 0, zIndex: 40, padding: '20px 40px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => loadData(token)}>
            <div style={{ border: '1px solid var(--accent-gold)', padding: '8px', borderRadius: '2px' }}>
              <Car style={{ color: 'var(--accent-gold)', width: '20px', height: '20px' }} />
            </div>
            <div>
              <h1 className="title-serif" style={{ fontSize: '20px', color: '#fff' }}>CARVERSAL</h1>
              <span style={{ fontSize: '9px', display: 'block', color: 'var(--text-muted)', letterSpacing: '3px', textTransform: 'uppercase' }}>Motors</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {user.is_staff && (
               <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '12px' }} onClick={() => setActiveModal('add_car')}>
                 <PlusCircle style={{ width: '14px' }} /> ADD INVENTORY
               </button>
            )}
            
            <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '12px', borderColor: cartItemCount > 0 ? 'var(--accent-gold)' : '' }} onClick={() => setActiveModal('cart')}>
              <ShoppingBag style={{ width: '14px' }} /> RESERVATIONS {cartItemCount > 0 && `(${cartItemCount})`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '24px', borderLeft: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User style={{ width: '16px', color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>{user.username}</span>
              </div>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Sign Out">
                <LogOut style={{ width: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '60px 40px' }}>
        
        {/* Header / Filter Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h2 className="title-serif" style={{ fontSize: '32px', marginBottom: '12px' }}>Inventory</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Explore {cars.length} exclusive vehicles currently available for reservation.</p>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px' }}>
            <input type="text" className="input-luxury" placeholder="Search..." style={{ width: '200px', padding: '10px 16px' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            
            <select className="input-luxury" style={{ width: '160px', padding: '10px 16px' }} value={selectedMake} onChange={e => setSelectedMake(e.target.value)}>
              <option value="">All Marques</option>
              {filters.makes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <button type="submit" className="btn-gold" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter style={{ width: '16px' }} /> FILTER
            </button>
          </form>
        </div>

        {/* Inventory Grid */}
        {cars.length === 0 ? (
          <div className="luxury-panel" style={{ padding: '100px 40px', textAlign: 'center' }}>
            <h3 className="title-serif" style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No Vehicles Found</h3>
            <p style={{ color: '#52525b' }}>Adjust your filters to discover our collection.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
            {cars.map((car, idx) => (
              <motion.div 
                key={car.id}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="luxury-panel car-card"
                style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                onClick={() => { setSelectedCar(car); setActiveModal('detail'); }}
              >
                <div className="car-image-container" style={{ height: '220px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border-light)' }}>
                  <img src={car.image_url || '/placeholder.jpg'} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.8)', padding: '6px 12px', border: `1px solid ${car.is_reserved ? '#ef4444' : 'var(--accent-gold)'}`, fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: car.is_reserved ? '#ef4444' : 'var(--accent-gold)' }}>
                    {car.is_reserved ? 'RESERVED' : (car.condition || 'Pre-Owned')}
                  </div>
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>{car.make}</span>
                  <h3 style={{ fontSize: '20px', marginBottom: '16px', fontFamily: 'var(--font-family)' }}>{car.model}</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', flex: 1 }}>
                    <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '12px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>YEAR</div>
                      <div style={{ fontSize: '14px', marginTop: '2px' }}>{car.year}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '12px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>POWER</div>
                      <div style={{ fontSize: '14px', marginTop: '2px' }}>{car.horsepower} HP</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>PRICE</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--accent-gold)' }}>${Number(car.price).toLocaleString()}</div>
                    </div>
                    <ChevronRight style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Global Toasts */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            style={{ position: 'fixed', bottom: '40px', right: '40px', background: 'rgba(15,15,17,0.95)', border: `1px solid ${message.type === 'error' ? '#ef4444' : 'var(--accent-gold)'}`, color: '#fff', padding: '16px 24px', borderRadius: '4px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
          >
            {message.type === 'error' ? <XCircle style={{ color: '#ef4444', width: '20px' }} /> : <Check style={{ color: 'var(--accent-gold)', width: '20px' }} />}
            <span style={{ fontSize: '13px', letterSpacing: '0.5px' }}>{message.text}</span>
            <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '16px' }}><X style={{ width: '16px' }}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {/* Reservation Cart Modal */}
        {activeModal === 'cart' && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="luxury-panel" style={{ width: '100%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '30px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="title-serif" style={{ fontSize: '20px' }}>Your Reservations</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
              </div>
              
              <div style={{ padding: '30px', overflowY: 'auto' }}>
                {cart.items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No vehicles in your reservation list.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {cart.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <img src={item.image_url} alt={item.model} style={{ width: '120px', height: '80px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.make}</div>
                          <div style={{ fontSize: '16px', fontWeight: '600' }}>{item.model}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Full Price: ${Number(item.price).toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: 'var(--accent-gold)', marginBottom: '4px' }}>Deposit</div>
                          <div style={{ fontSize: '18px', fontWeight: '600' }}>${item.subtotal.toLocaleString()}</div>
                          <button onClick={() => handleRemoveFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', marginTop: '8px', textTransform: 'uppercase' }}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.items.length > 0 && (
                <div style={{ padding: '30px', borderTop: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Deposit Required</span>
                    <span style={{ fontSize: '24px', fontWeight: '600', color: 'var(--accent-gold)' }}>${cart.total_prebooking_price.toLocaleString()}</span>
                  </div>
                  <button className="btn-gold" style={{ width: '100%' }} onClick={handleCheckout}>Proceed to Checkout</button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Car Detail Modal */}
        {activeModal === 'detail' && selectedCar && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="luxury-panel" style={{ width: '100%', maxWidth: '900px', display: 'flex', overflow: 'hidden' }}>
              
              <div style={{ width: '50%', position: 'relative' }}>
                <img src={selectedCar.image_url} alt={selectedCar.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}><X /></button>
              </div>
              
              <div style={{ width: '50%', padding: '40px', display: 'flex', flexDirection: 'column', maxHeight: '80vh', overflowY: 'auto' }}>
                <span style={{ fontSize: '12px', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>{selectedCar.make}</span>
                <h2 className="title-serif" style={{ fontSize: '36px', marginBottom: '24px', lineHeight: 1.2 }}>{selectedCar.model}</h2>
                
                <div style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>${Number(selectedCar.price).toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '32px' }}>Reservation Deposit: ${selectedCar.pre_booking_amount.toLocaleString()}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>YEAR</div>
                    <div style={{ fontSize: '16px', marginTop: '4px' }}>{selectedCar.year}</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>POWER</div>
                    <div style={{ fontSize: '16px', marginTop: '4px' }}>{selectedCar.horsepower} HP</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MILEAGE</div>
                    <div style={{ fontSize: '16px', marginTop: '4px' }}>{selectedCar.mileage} mpg</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>STYLE</div>
                    <div style={{ fontSize: '16px', marginTop: '4px' }}>{selectedCar.style || 'N/A'}</div>
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8, marginBottom: '40px', flex: 1 }}>
                  {selectedCar.desc}
                </p>

                <button 
                  className="btn-gold" 
                  style={{ width: '100%', opacity: selectedCar.is_reserved ? 0.5 : 1, cursor: selectedCar.is_reserved ? 'not-allowed' : 'pointer' }} 
                  disabled={selectedCar.is_reserved}
                  onClick={() => { if(!selectedCar.is_reserved) { setActiveModal(null); handleAddToCart(selectedCar.id); } }}
                >
                  {selectedCar.is_reserved ? (selectedCar.reserved_by === user.username ? 'RESERVED BY YOU' : 'VEHICLE RESERVED') : 'Reserve Vehicle'}
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {/* Add Car Modal (Staff Only) */}
        {activeModal === 'add_car' && user?.is_staff && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="luxury-panel" style={{ width: '100%', maxWidth: '600px', padding: '40px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 className="title-serif" style={{ fontSize: '24px' }}>Add Inventory</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
              </div>

              <form onSubmit={handleAddCarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <input type="text" className="input-luxury" required placeholder="Make (e.g. Porsche)" value={newCarForm.make} onChange={(e) => setNewCarForm({ ...newCarForm, make: e.target.value })} />
                  <input type="text" className="input-luxury" required placeholder="Model" value={newCarForm.model} onChange={(e) => setNewCarForm({ ...newCarForm, model: e.target.value })} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <input type="number" className="input-luxury" required placeholder="Year" value={newCarForm.year} onChange={(e) => setNewCarForm({ ...newCarForm, year: e.target.value })} />
                  <input type="number" className="input-luxury" placeholder="HP" value={newCarForm.horsepower} onChange={(e) => setNewCarForm({ ...newCarForm, horsepower: e.target.value })} />
                  <input type="number" className="input-luxury" placeholder="MPG" value={newCarForm.mileage} onChange={(e) => setNewCarForm({ ...newCarForm, mileage: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <input type="text" className="input-luxury" placeholder="Style (Coupe/SUV)" value={newCarForm.style} onChange={(e) => setNewCarForm({ ...newCarForm, style: e.target.value })} />
                  <input type="number" className="input-luxury" required placeholder="Price ($)" value={newCarForm.price} onChange={(e) => setNewCarForm({ ...newCarForm, price: e.target.value })} />
                </div>

                <textarea className="input-luxury" style={{ minHeight: '100px' }} required placeholder="Vehicle description..." value={newCarForm.desc} onChange={(e) => setNewCarForm({ ...newCarForm, desc: e.target.value })}></textarea>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Vehicle Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setCarImage(e.target.files[0])} className="input-luxury" style={{ padding: '10px' }} />
                </div>

                <button type="submit" className="btn-gold" style={{ marginTop: '16px' }}>Publish to Showroom</button>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}
