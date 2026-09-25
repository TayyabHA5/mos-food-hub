'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SuperAdminDashboard() {
  const [restaurants, setRestaurants] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)

  const [loading, setLoading] = useState(true)
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000')

  // Add Outlet State
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectedLogo, setSelectedLogo] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    cuisine: '',
    floor: 'Food Court (3rd Floor)',
    tagline: '',
    opening_time: '11:00',
    closing_time: '23:00',
    status_override: 'auto'
  })

  // Edit Outlet State
  const [editingRestaurant, setEditingRestaurant] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    slug: '',
    cuisine: '',
    floor: 'Food Court (3rd Floor)',
    tagline: '',
    opening_time: '11:00',
    closing_time: '23:00',
    status_override: 'auto'
  })
  const [editLogo, setEditLogo] = useState(null)

  // Menu Management State
  const [managingRestaurant, setManagingRestaurant] = useState(null)
  const [newMenuFiles, setNewMenuFiles] = useState([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        setBackendUrl(`http://${hostname}:8000`)
      }
    }

    const role = localStorage.getItem('mos-role')
    const token = localStorage.getItem('mos-token')

    if (role !== 'super_admin' || !token) {
      router.push('/admin/login')
      return
    }

    fetchRestaurants()
  }, [router])

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const handleEditNameChange = (e) => {
    const name = e.target.value
    setEditFormData({
      ...editFormData,
      name,
      slug: generateSlug(name)
    })
  }

  const fetchRestaurants = async () => {
    try {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
      const activeUrl = currentHost !== 'localhost' && currentHost !== '127.0.0.1'
        ? `http://${currentHost}:8000`
        : 'http://localhost:8000'

      const response = await fetch(`${activeUrl}/restaurants/`)
      if (!response.ok) throw new Error('Failed to load data')
      const data = await response.json()
      setRestaurants(data)

      if (managingRestaurant) {
        const updated = data.find(r => r.id === managingRestaurant.id)
        if (updated) setManagingRestaurant(updated)
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const token = localStorage.getItem('mos-token')

    const data = new FormData()
    data.append('name', formData.name)
    data.append('slug', formData.slug)
    data.append('cuisine', formData.cuisine)
    data.append('floor', formData.floor)
    data.append('tagline', formData.tagline || '')
    data.append('opening_time', formData.opening_time || '11:00')
    data.append('closing_time', formData.closing_time || '23:00')
    data.append('status_override', formData.status_override || 'auto')

    if (selectedLogo) {
      data.append('logo', selectedLogo)
    }

    for (let i = 0; i < selectedFiles.length; i++) {
      data.append('images', selectedFiles[i])
    }

    try {
      const response = await fetch(`${backendUrl}/restaurants/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      })

      if (response.ok) {
        setShowAddModal(false)
        fetchRestaurants()
        setFormData({
          name: '',
          slug: '',
          cuisine: '',
          floor: 'Food Court (3rd Floor)',
          tagline: '',
          opening_time: '11:00',
          closing_time: '23:00',
          status_override: 'auto'
        })
        setSelectedFiles([])
        setSelectedLogo(null)
      } else {
        const errData = await response.json()
        alert(`Server Error: ${errData.detail || 'Failed to create'}`)
      }
    } catch (err) {
      alert(`Network Error: Could not connect to backend`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (res) => {
    setEditingRestaurant(res)
    setEditFormData({
      name: res.name,
      slug: res.slug,
      cuisine: res.cuisine,
      floor: res.floor,
      tagline: res.tagline || '',
      opening_time: res.opening_time || '11:00',
      closing_time: res.closing_time || '23:00',
      status_override: res.status_override || 'auto'
    })
    setEditLogo(null)
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingRestaurant) return
    setIsSubmitting(true)
    const token = localStorage.getItem('mos-token')

    const data = new FormData()
    data.append('name', editFormData.name)
    data.append('slug', editFormData.slug)
    data.append('cuisine', editFormData.cuisine)
    data.append('floor', editFormData.floor)
    data.append('tagline', editFormData.tagline || '')
    data.append('opening_time', editFormData.opening_time || '11:00')
    data.append('closing_time', editFormData.closing_time || '23:00')
    data.append('status_override', editFormData.status_override || 'auto')

    if (editLogo) {
      data.append('logo', editLogo)
    }

    try {
      const response = await fetch(`${backendUrl}/restaurants/${editingRestaurant.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      })

      if (response.ok) {
        setShowEditModal(false)
        setEditingRestaurant(null)
        fetchRestaurants()
      } else {
        const errData = await response.json()
        alert(`Server Error: ${errData.detail || 'Failed to update'}`)
      }
    } catch (err) {
      alert(`Network Error: Could not connect to backend`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return

    const token = localStorage.getItem('mos-token')
    try {
      const response = await fetch(`${backendUrl}/restaurants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) fetchRestaurants()
    } catch (err) {
      alert('Network error during delete')
    }
  }

  const openMenuModal = (res) => {
    setManagingRestaurant(res)
    setNewMenuFiles([])
    setShowMenuModal(true)
  }

  const handleDeleteMenuImage = async (imageUrl) => {
    if (!managingRestaurant) return
    if (!confirm('Delete this menu image?')) return

    const token = localStorage.getItem('mos-token')
    try {
      const response = await fetch(`${backendUrl}/restaurants/${managingRestaurant.id}/menu-images`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_url: imageUrl })
      })

      if (response.ok) {
        const updatedRes = await response.json()
        setManagingRestaurant(updatedRes)
        fetchRestaurants()
      } else {
        alert('Failed to delete image')
      }
    } catch (err) {
      alert('Network error deleting image')
    }
  }

  const handleUploadNewMenuImages = async (e) => {
    e.preventDefault()
    if (!managingRestaurant || newMenuFiles.length === 0) return
    setIsSubmitting(true)

    const token = localStorage.getItem('mos-token')
    const data = new FormData()
    for (let i = 0; i < newMenuFiles.length; i++) {
      data.append('images', newMenuFiles[i])
    }

    try {
      const response = await fetch(`${backendUrl}/restaurants/${managingRestaurant.id}/menu-images`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      })

      if (response.ok) {
        const updatedRes = await response.json()
        setManagingRestaurant(updatedRes)
        setNewMenuFiles([])
        fetchRestaurants()
      } else {
        alert('Failed to upload new menu images')
      }
    } catch (err) {
      alert('Network error uploading images')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/admin/login')
  }

  if (loading) return (
    <main className="min-h-screen bg-[#08121e] flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 border-4 border-[#f5ba4b] border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-xs uppercase tracking-widest text-[#f5ba4b]">Loading Directory...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#08121e] text-[#e6edf8]">
      <nav className="border-b border-[#1e2e40] bg-[#0b1722] px-6 py-4 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <h1 className="text-lg font-black tracking-tight text-white">Super Admin <span className="text-[#f5ba4b]">Directory Editor</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[#8a9db0] font-mono uppercase bg-[#08121e] px-3 py-1 rounded-full border border-[#1e2e40]">API: {backendUrl}</span>
            <button onClick={handleLogout} className="text-xs font-bold text-[#8a9db0] hover:text-red-400 transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl p-6 sm:p-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1e2e40]">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">Mall Directory</h2>
            <p className="mt-1 text-xs text-[#8a9db0]">Create, edit, and manage menu galleries and operational hours for all outlets in Mall of Sargodha.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-2xl bg-[#f5ba4b] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#121110] hover:bg-[#f6c360] active:scale-95 transition-all shadow-lg shadow-[#f5ba4b]/15"
          >
            + Add New Outlet
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-[#1e2e40] rounded-[36px] bg-[#0f1d2c]/50">
              <p className="text-sm font-medium text-[#8a9db0]">No restaurants found in directory. Create your first one!</p>
            </div>
          ) : (
            restaurants.map(res => (
              <div key={res.id} className="rounded-3xl border border-[#1e2e40] bg-[#0f1d2c] p-6 shadow-xl hover:border-[#f5ba4b]/40 transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-[#142637] flex items-center justify-center overflow-hidden border border-[#21354a] text-xl font-bold text-[#f5ba4b]">
                      {res.logo_url ? (
                        <img src={`${backendUrl}${res.logo_url}`} className="h-full w-full object-cover" alt="logo" />
                      ) : (
                        res.name[0]
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(res)}
                        className="px-3 py-1.5 rounded-xl border border-[#21354a] bg-[#08121e] text-[#f5ba4b] hover:border-[#f5ba4b] text-[10px] uppercase font-bold transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] uppercase font-bold transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-white leading-tight">{res.name}</h3>
                    {res.is_open ? (
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-tight">
                        🟢 Open
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[9px] font-bold text-red-400 uppercase tracking-tight">
                        🔴 Closed
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-[#8a9db0] font-semibold uppercase tracking-wider">{res.cuisine} • {res.floor}</p>

                  <div className="mt-2 flex items-center gap-2 text-[10px] text-[#8a9db0] font-mono">
                    <span>⏰ Hours: {res.opening_time || '11:00'} - {res.closing_time || '23:00'}</span>
                    <span className="text-[#f5ba4b]">({res.status_override === 'auto' ? 'Scheduled' : res.status_override})</span>
                  </div>

                  {res.tagline && <p className="mt-2 text-xs italic text-[#f5ba4b]/80">"{res.tagline}"</p>}
                </div>

                <div className="mt-6 border-t border-[#1e2e40] pt-4">
                   <div className="flex items-center justify-between mb-3">
                     <p className="text-[10px] uppercase text-[#8a9db0] font-bold tracking-wider">Menu Gallery</p>
                     <span className="text-[10px] font-bold text-[#f5ba4b] bg-[#f5ba4b]/10 border border-[#f5ba4b]/20 px-2 py-0.5 rounded-full">
                      {res.menu_images ? JSON.parse(res.menu_images).length : 0} Pages
                     </span>
                   </div>

                   <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {res.menu_images && JSON.parse(res.menu_images).length > 0 ?
                        JSON.parse(res.menu_images).map((imgUrl, i) => (
                          <div key={i} className="h-16 w-12 rounded-xl bg-[#142637] shrink-0 overflow-hidden border border-[#21354a]">
                             <img
                               src={`${backendUrl}${imgUrl}`}
                               alt="menu"
                               className="h-full w-full object-cover"
                               onError={(e) => { e.target.style.display='none' }}
                             />
                          </div>
                        )) : <span className="text-[11px] text-[#5b6e82] italic py-2">No images uploaded</span>}
                   </div>

                   <button
                    onClick={() => openMenuModal(res)}
                    className="mt-4 w-full rounded-2xl border border-[#21354a] bg-[#08121e] py-3 text-xs font-bold text-[#f5ba4b] hover:border-[#f5ba4b] transition-all shadow-md"
                  >
                    Manage Menu Images →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ADD RESTAURANT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[36px] border border-[#1e2e40] bg-[#0f1d2c] p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="mb-6 pb-4 border-b border-[#1e2e40] flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">New Outlet</h2>
                <p className="text-xs text-[#8a9db0]">Add a new shop to Mall of Sargodha directory.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-xs font-bold text-[#8a9db0] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Restaurant Name</label>
                <input
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. KFC, Pizza Hut"
                  className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#5b6e82] uppercase tracking-widest mb-1.5 block">Auto-Generated Slug</label>
                <input
                  value={formData.slug}
                  className="w-full rounded-2xl border border-[#1e2e40] bg-[#04090f] px-4 py-3 text-[#5b6e82] outline-none cursor-not-allowed text-xs font-mono"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Cuisine</label>
                  <input
                    value={formData.cuisine}
                    onChange={e => setFormData({...formData, cuisine: e.target.value})}
                    placeholder="e.g. Fast Food"
                    className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Floor</label>
                  <select
                    value={formData.floor}
                    onChange={e => setFormData({...formData, floor: e.target.value})}
                    className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b] appearance-none"
                  >
                    <option>Ground Floor</option>
                    <option>1st Floor</option>
                    <option>2nd Floor</option>
                    <option>Food Court (3rd Floor)</option>
                  </select>
                </div>
              </div>

              {/* Schedule Hours & Status Override */}
              <div className="grid grid-cols-2 gap-3 border-t border-[#1e2e40] pt-3">
                <div>
                  <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Opening Time</label>
                  <input
                    type="time"
                    value={formData.opening_time}
                    onChange={e => setFormData({...formData, opening_time: e.target.value})}
                    className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Closing Time</label>
                  <input
                    type="time"
                    value={formData.closing_time}
                    onChange={e => setFormData({...formData, closing_time: e.target.value})}
                    className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Status Mode</label>
                <select
                  value={formData.status_override}
                  onChange={e => setFormData({...formData, status_override: e.target.value})}
                  className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b]"
                >
                  <option value="auto">Auto (Follow Scheduled Hours)</option>
                  <option value="force_open">Force Open (Always Open)</option>
                  <option value="force_closed">Force Closed (Holiday/Maintenance)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#1e2e40] pt-3">
                <div>
                  <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Shop Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setSelectedLogo(e.target.files[0])}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex flex-col items-center justify-center w-full h-24 rounded-2xl border-2 border-dashed border-[#1e2e40] bg-[#08121e] hover:border-[#f5ba4b]/50 cursor-pointer transition-all"
                  >
                    <span className="text-xl mb-1">🏪</span>
                    <span className="text-[10px] font-bold text-[#8a9db0]">
                      {selectedLogo ? 'Logo Selected' : 'Upload Logo'}
                    </span>
                  </label>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Menu Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => setSelectedFiles(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-24 rounded-2xl border-2 border-dashed border-[#1e2e40] bg-[#08121e] hover:border-[#f5ba4b]/50 cursor-pointer transition-all"
                  >
                    <span className="text-xl mb-1">📸</span>
                    <span className="text-[10px] font-bold text-[#8a9db0]">
                      {selectedFiles.length > 0 ? `${selectedFiles.length} Menus` : 'Upload Menus'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-3 pt-4 border-t border-[#1e2e40]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-2xl border border-[#1e2e40] py-3.5 text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl bg-[#f5ba4b] py-3.5 text-xs font-bold uppercase tracking-wider text-[#121110] shadow-lg shadow-[#f5ba4b]/15 hover:bg-[#f6c360] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RESTAURANT MODAL */}
      {showEditModal && editingRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[36px] border border-[#1e2e40] bg-[#0f1d2c] p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="mb-6 pb-4 border-b border-[#1e2e40] flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Edit Restaurant</h2>
                <p className="text-xs text-[#8a9db0]">Update outlet details for {editingRestaurant.name}.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-xs font-bold text-[#8a9db0] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Restaurant Name</label>
                <input
                  value={editFormData.name}
                  onChange={handleEditNameChange}
                  className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#5b6e82] uppercase tracking-widest mb-1.5 block">Slug</label>
                <input
                  value={editFormData.slug}
                  onChange={e => setEditFormData({...editFormData, slug: e.target.value})}
                  className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-xs font-mono text-[#e6edf8] outline-none focus:border-[#f5ba4b]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Cuisine</label>
                  <input
                    value={editFormData.cuisine}
                    onChange={e => setEditFormData({...editFormData, cuisine: e.target.value})}
                    className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Floor</label>
                  <select
                    value={editFormData.floor}
                    onChange={e => setEditFormData({...editFormData, floor: e.target.value})}
                    className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b] appearance-none"
                  >
                    <option>Ground Floor</option>
                    <option>1st Floor</option>
                    <option>2nd Floor</option>
                    <option>Food Court (3rd Floor)</option>
                  </select>
                </div>
              </div>

              {/* Schedule Hours & Status Override */}
              <div className="grid grid-cols-2 gap-3 border-t border-[#1e2e40] pt-3">
                <div>
                  <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Opening Time</label>
                  <input
                    type="time"
                    value={editFormData.opening_time}
                    onChange={e => setEditFormData({...editFormData, opening_time: e.target.value})}
                    className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Closing Time</label>
                  <input
                    type="time"
                    value={editFormData.closing_time}
                    onChange={e => setEditFormData({...editFormData, closing_time: e.target.value})}
                    className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Status Mode</label>
                <select
                  value={editFormData.status_override}
                  onChange={e => setEditFormData({...editFormData, status_override: e.target.value})}
                  className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b]"
                >
                  <option value="auto">Auto (Follow Scheduled Hours)</option>
                  <option value="force_open">Force Open (Always Open)</option>
                  <option value="force_closed">Force Closed (Holiday/Maintenance)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Tagline</label>
                <input
                  value={editFormData.tagline}
                  onChange={e => setEditFormData({...editFormData, tagline: e.target.value})}
                  placeholder="e.g. Finger Lickin Good"
                  className="w-full rounded-2xl border border-[#1e2e40] bg-[#08121e] px-4 py-3 text-sm text-[#e6edf8] outline-none focus:border-[#f5ba4b]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest mb-1.5 block">Replace Logo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setEditLogo(e.target.files[0])}
                  className="hidden"
                  id="edit-logo-upload"
                />
                <label
                  htmlFor="edit-logo-upload"
                  className="flex items-center gap-3 w-full p-3.5 rounded-2xl border-2 border-dashed border-[#1e2e40] bg-[#08121e] hover:border-[#f5ba4b]/50 cursor-pointer transition-all"
                >
                  <span className="text-xl">🖼️</span>
                  <span className="text-xs font-bold text-[#8a9db0]">
                    {editLogo ? editLogo.name : 'Choose New Logo File'}
                  </span>
                </label>
              </div>

              <div className="mt-8 flex gap-3 pt-4 border-t border-[#1e2e40]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-2xl border border-[#1e2e40] py-3.5 text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl bg-[#f5ba4b] py-3.5 text-xs font-bold uppercase tracking-wider text-[#121110] shadow-lg shadow-[#f5ba4b]/15 hover:bg-[#f6c360] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE MENU GALLERY MODAL */}
      {showMenuModal && managingRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-[36px] border border-[#1e2e40] bg-[#0f1d2c] p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="mb-6 pb-4 border-b border-[#1e2e40] flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Manage Menu Gallery</h2>
                <p className="text-xs text-[#8a9db0] font-semibold">{managingRestaurant.name}</p>
              </div>
              <button
                onClick={() => setShowMenuModal(false)}
                className="text-xs font-bold text-[#8a9db0] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            {/* Current Menu Gallery Grid */}
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5ba4b] mb-3">Current Menu Pages</p>
              {managingRestaurant.menu_images && JSON.parse(managingRestaurant.menu_images).length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {JSON.parse(managingRestaurant.menu_images).map((imgUrl, idx) => (
                    <div key={idx} className="relative group rounded-2xl bg-[#08121e] border border-[#1e2e40] overflow-hidden p-1">
                      <img src={`${backendUrl}${imgUrl}`} alt={`menu-${idx}`} className="h-32 w-full object-cover rounded-xl" />
                      <button
                        onClick={() => handleDeleteMenuImage(imgUrl)}
                        className="absolute top-2 right-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white p-1 text-[10px] font-bold shadow-md transition-transform hover:scale-110"
                        title="Delete image"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#1e2e40] bg-[#08121e] p-8 text-center text-xs text-[#8a9db0]">
                  No menu images uploaded yet for this outlet.
                </div>
              )}
            </div>

            {/* Add New Menu Images Form */}
            <form onSubmit={handleUploadNewMenuImages} className="border-t border-[#1e2e40] pt-6 space-y-4">
              <label className="text-[10px] font-bold text-[#f5ba4b] uppercase tracking-widest block">Upload Additional Menu Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={e => setNewMenuFiles(e.target.files)}
                className="hidden"
                id="add-menu-files"
              />
              <label
                htmlFor="add-menu-files"
                className="flex flex-col items-center justify-center w-full h-28 rounded-2xl border-2 border-dashed border-[#1e2e40] bg-[#08121e] hover:border-[#f5ba4b]/50 cursor-pointer transition-all"
              >
                <span className="text-2xl mb-1">📸</span>
                <span className="text-xs font-bold text-[#8a9db0]">
                  {newMenuFiles.length > 0 ? `${newMenuFiles.length} New Images Selected` : 'Click to select image files'}
                </span>
              </label>

              <button
                type="submit"
                disabled={newMenuFiles.length === 0 || isSubmitting}
                className="w-full rounded-2xl bg-[#f5ba4b] py-3.5 text-xs font-bold uppercase tracking-wider text-[#121110] disabled:opacity-40 shadow-lg shadow-[#f5ba4b]/15 hover:bg-[#f6c360] active:scale-95 transition-all"
              >
                {isSubmitting ? 'Uploading...' : 'Upload & Append To Gallery'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
