import { restaurants as initialRestaurants } from './restaurants'

export const RESTAURANTS_STORAGE_KEY = 'mos-restaurants'

export function readRestaurants() {
  if (typeof window === 'undefined') return initialRestaurants

  try {
    const savedRestaurants = JSON.parse(window.localStorage.getItem(RESTAURANTS_STORAGE_KEY) || 'null')
    return Array.isArray(savedRestaurants) ? savedRestaurants : initialRestaurants
  } catch (error) {
    return initialRestaurants
  }
}

export function writeRestaurants(nextRestaurants) {
  window.localStorage.setItem(RESTAURANTS_STORAGE_KEY, JSON.stringify(nextRestaurants))
}
