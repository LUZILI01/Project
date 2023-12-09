// src/services/userApi.js
import request from './apiService'

export function registerUser (userInfo) {
  return request.post('/user/auth/register', userInfo)
}

export function loginUser (userInfo) {
  return request.post('/user/auth/login', userInfo)
}

export function getUserInfo (username) {
  return request.get(`/user/auth/${username}`)
}

export function getListings () {
  return request.get('/api/v1/book/getBooks')
}

export function searchListings (query) {
  return request.post('/api/v1/book/getBooks', query)
}

export function createListing (userInfo) {
  return request.post('/api/v1/book/addbook', userInfo)
}

export function updateListing (id, data) {
  return request.post('/api/v1/book/updateBook', data)
}

export function deleteBook (id) {
  return request.delete(`/api/v1/book/deleteBook/${id}`);
}

export function getListing (id) {
  return request.get(`/api/v1/book/detail/${id}`);
}

export function getCollectList () {
  return request.get('/api/v1/book/getCollectList');
}

export function collectListing (bookId) {
  return request.put(`/api/v1/user/collectBook/${bookId}`);
}

export function uncollectListing (bookId) {
  return request.delete(`/api/v1/user/uncollectBook/${bookId}`);
}

export function submitReview (bookid, data) {
  return request.put(`/api/v1/book/addReview/${bookid}`, data)
}

export function deleteReview (bookId, reviewid) {
  return request.delete(`/api/v1/book/deleteReview/${bookId}/${reviewid}`)
}
