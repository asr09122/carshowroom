const API_BASE = '/api/core';

export async function fetchCars(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/cars/?${query}`);
  if (!res.ok) throw new Error('Failed to fetch cars');
  return res.json();
}

export async function fetchCarDetail(id) {
  const res = await fetch(`${API_BASE}/cars/${id}/`);
  if (!res.ok) throw new Error('Failed to fetch car detail');
  return res.json();
}

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function signupUser(payload) {
  const res = await fetch(`${API_BASE}/auth/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data;
}

export async function removeCartItem(token, itemId) {
  const res = await fetch(`${API_BASE}/cart/${itemId}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to remove from cart');
  return data;
}

export async function checkoutCart(token) {
  const res = await fetch(`${API_BASE}/cart/checkout/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to checkout');
  return data;
}

export async function fetchCart(token) {
  const res = await fetch(`${API_BASE}/cart/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch cart');
  return data;
}

export async function addToCart(token, car_id) {
  const res = await fetch(`${API_BASE}/cart/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ car_id })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add to cart');
  return data;
}

export async function addCarListing(token, formData) {
  const res = await fetch(`${API_BASE}/cars/add/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create car listing');
  return data;
}
