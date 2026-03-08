import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import ProductServiceAdmin from './pages/ProductServiceAdmin'
import ProductUserItem from './pages/ProductUserItem'
import ProductUserDescription from './pages/ProductUserDescription'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<ProductServiceAdmin />} />
        <Route path="/products" element={<ProductUserItem />} />
        <Route path="/products/:id" element={<ProductUserDescription />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
