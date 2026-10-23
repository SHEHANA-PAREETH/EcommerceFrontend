import client from './client'

// categories rarely change, so they are fetched once per visit
let categories
export const getCategories = () => {
  categories ||= client.get('/category').then((res) => res.data).catch((error) => { categories = undefined; throw error })
  return categories
}
export const resetCategories = () => { categories = undefined }

let config
export const getConfig = () => {
  config ||= client.get('/config').then((res) => res.data).catch(() => ({ card: false, currency: 'INR' }))
  return config
}
