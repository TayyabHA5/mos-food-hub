'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SuperAdminDashboard() {
  const [restaurants, setRestaurants] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)

  const [loading, setLoading] = useState(true)
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://mall-of-sargodha-backend-dl1yin-7b34d3-187-77-180-230.sslip.io'

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
    status_override: 'auto',
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
    status_override: 'auto',
  })
  const [editLogo, setEditLogo] = useState(null)
  const [editMenuFiles, setEditMenuFiles] = useState([])

  // Menu Management State
  const [managingRestaurant, setManagingRestaurant] = useState(null)
  const [newMenuFiles, setNewMenuFiles] = useState([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
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
      slug: generateSlug(name),
    })
  }

  const handleEditNameChange = (e) => {
    const name = e.target.value
    setEditFormData({
      ...editFormData,
      name,
      slug: generateSlug(name),
    })
  }

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${backendUrl}/restaurants/`)
      if (!response.ok) throw new Error('Failed to load data')
      const data = await response.json()
      setRestaurants(data)

      if (managingRestaurant) {
        const updated = data.find((r) => r.id === managingRestaurant.id)
        if (updated) setManagingRestaurant(updated)
      }
      if (editingRestaurant) {
        const updatedEdit = data.find((r) => r.id === editingRestaurant.id)
        if (updatedEdit) setEditingRestaurant(updatedEdit)
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
        headers: { Authorization: `Bearer ${token}` },
        body: data,
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
          status_override: 'auto',
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
      status_override: res.status_override || 'auto',
    })
    setEditLogo(null)
    setEditMenuFiles([])
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
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })

      if (response.ok) {
        if (editMenuFiles.length > 0) {
          const menuData = new FormData()
          for (let i = 0; i < editMenuFiles.length; i++) {
            menuData.append('images', editMenuFiles[i])
          }
          await fetch(`${backendUrl}/restaurants/${editingRestaurant.id}/menu-images`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: menuData,
          })
        }

        setShowEditModal(false)
        setEditingRestaurant(null)
        setEditMenuFiles([])
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
        headers: { Authorization: `Bearer ${token}` },
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

  const handleDeleteMenuImage = async (imageUrl, targetRes = null) => {
    const resToUpdate = targetRes || managingRestaurant || editingRestaurant
    if (!resToUpdate) return
    if (!confirm('Delete this menu image?')) return

    const token = localStorage.getItem('mos-token')
    try {
      const response = await fetch(
        `${backendUrl}/restaurants/${resToUpdate.id}/menu-images`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image_url: imageUrl }),
        }
      )

      if (response.ok) {
        const updatedRes = await response.json()
        if (managingRestaurant && managingRestaurant.id === resToUpdate.id) {
          setManagingRestaurant(updatedRes)
        }
        if (editingRestaurant && editingRestaurant.id === resToUpdate.id) {
          setEditingRestaurant(updatedRes)
        }
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
      const response = await fetch(
        `${backendUrl}/restaurants/${managingRestaurant.id}/menu-images`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        }
      )

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

  const formatTime12 = (timeStr = '11:00') => {
    try {
      const [h, m] = timeStr.split(':').map(Number)
      const period = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 === 0 ? 12 : h % 12
      const mStr = m < 10 ? `0${m}` : m
      return `${h12}:${mStr} ${period}`
    } catch (e) {
      return timeStr
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc] dark:bg-black flex flex-col items-center justify-center gap-3 font-sans transition-colors duration-200">
        <div className="h-8 w-8 border-2 border-slate-900 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="font-semibold text-xs text-slate-600 dark:text-amber-400">Loading Directory...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-black text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <nav className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 shadow-subtle">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-black font-bold text-sm">
              M
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Directory Editor <span className="font-normal text-slate-500 dark:text-zinc-400">· Super Admin</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              ← Overview
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl p-6 sm:p-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Mall Directory</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Create, edit, and manage menu galleries and operational hours for all outlets in Mall of Sargodha.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-slate-900 dark:bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors shadow-subtle font-bold"
          >
            + Add New Outlet
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.length === 0 ? (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">No restaurants found in directory. Create your first one!</p>
            </div>
          ) : (
            restaurants.map((res) => (
              <div
                key={res.id}
                className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-subtle hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-zinc-800 text-base font-bold text-slate-800 dark:text-amber-400">
                      {res.logo_url ? (
                        <img src={`${backendUrl}${res.logo_url}`} className="h-full w-full object-cover" alt="logo" />
                      ) : (
                        res.name[0]
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(res)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-semibold transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{res.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{res.cuisine} · {res.floor}</p>

                  <div className="mt-3 py-2 border-y border-slate-100 dark:border-zinc-800 text-xs space-y-1">
                    <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                      <span>Hours:</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {formatTime12(res.opening_time)} – {formatTime12(res.closing_time)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                      <span>Status:</span>
                      <span className={`font-semibold ${res.is_open ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-500'}`}>
                        {res.status_override === 'force_open'
                          ? 'Force Open'
                          : res.status_override === 'force_closed'
                          ? 'Force Closed'
                          : res.is_open
                          ? 'Open Now (Auto)'
                          : 'Closed (Auto)'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Menu Pages</p>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-amber-400 bg-slate-100 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-slate-200 dark:border-amber-500/20">
                        {res.menu_images ? JSON.parse(res.menu_images).length : 0} Pages
                      </span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
                      {res.menu_images && JSON.parse(res.menu_images).length > 0 ? (
                        JSON.parse(res.menu_images).map((imgUrl, i) => (
                          <div key={i} className="h-16 w-12 rounded-lg bg-slate-100 dark:bg-zinc-900 shrink-0 overflow-hidden border border-slate-200 dark:border-zinc-800">
                            <img
                              src={`${backendUrl}${imgUrl}`}
                              alt="menu"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-zinc-500 italic py-1">No images uploaded</span>
                      )}
                    </div>

                    <button
                      onClick={() => openMenuModal(res)}
                      className="mt-3 w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 py-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-colors"
                    >
                      Manage Menu Gallery
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ADD RESTAURANT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-modal">
            <div className="mb-5 pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Outlet</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Add a new outlet to Mall of Sargodha directory.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-xs font-bold text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Restaurant Name</label>
                <input
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. California Pizza, Subway"
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-500 mb-1 block">Slug</label>
                <input
                  value={formData.slug}
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black px-3.5 py-2 text-slate-500 dark:text-zinc-500 outline-none cursor-not-allowed text-xs font-mono"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Cuisine</label>
                  <input
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    placeholder="e.g. Fast Food"
                    className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Floor</label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                  >
                    <option>Ground Floor</option>
                    <option>1st Floor</option>
                    <option>2nd Floor</option>
                    <option>Food Court (3rd Floor)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-zinc-800 pt-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Opening Time</label>
                  <input
                    type="time"
                    value={formData.opening_time}
                    onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Closing Time</label>
                  <input
                    type="time"
                    value={formData.closing_time}
                    onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Status Mode</label>
                <select
                  value={formData.status_override}
                  onChange={(e) => setFormData({ ...formData, status_override: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                >
                  <option value="auto">Auto (Follow Scheduled Hours)</option>
                  <option value="force_open">Force Open (Always Open)</option>
                  <option value="force_closed">Force Closed (Holiday/Maintenance)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-zinc-800 pt-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Shop Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedLogo(e.target.files[0])}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex flex-col items-center justify-center w-full h-20 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-all text-xs font-medium text-slate-600 dark:text-zinc-300"
                  >
                    <span>{selectedLogo ? 'Logo Selected' : 'Upload Logo'}</span>
                  </label>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Menu Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-20 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-all text-xs font-medium text-slate-600 dark:text-zinc-300"
                  >
                    <span>{selectedFiles.length > 0 ? `${selectedFiles.length} Menus` : 'Upload Menus'}</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 dark:border-zinc-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-slate-900 dark:bg-amber-500 py-2.5 text-xs font-bold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors shadow-subtle disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RESTAURANT MODAL (WITH INTEGRATED MENU GALLERY & UPLOADER) */}
      {showEditModal && editingRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-modal space-y-5">
            <div className="pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Restaurant & Menus</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Update details & menu pages for {editingRestaurant.name}.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-xs font-bold text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Restaurant Name</label>
                <input
                  value={editFormData.name}
                  onChange={handleEditNameChange}
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-500 mb-1 block">Slug</label>
                <input
                  value={editFormData.slug}
                  onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-zinc-300 focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Cuisine</label>
                  <input
                    value={editFormData.cuisine}
                    onChange={(e) => setEditFormData({ ...editFormData, cuisine: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Floor</label>
                  <select
                    value={editFormData.floor}
                    onChange={(e) => setEditFormData({ ...editFormData, floor: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                  >
                    <option>Ground Floor</option>
                    <option>1st Floor</option>
                    <option>2nd Floor</option>
                    <option>Food Court (3rd Floor)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-zinc-800 pt-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Opening Time</label>
                  <input
                    type="time"
                    value={editFormData.opening_time}
                    onChange={(e) => setEditFormData({ ...editFormData, opening_time: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Closing Time</label>
                  <input
                    type="time"
                    value={editFormData.closing_time}
                    onChange={(e) => setEditFormData({ ...editFormData, closing_time: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Status Mode</label>
                <select
                  value={editFormData.status_override}
                  onChange={(e) => setEditFormData({ ...editFormData, status_override: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                >
                  <option value="auto">Auto (Follow Scheduled Hours)</option>
                  <option value="force_open">Force Open (Always Open)</option>
                  <option value="force_closed">Force Closed (Holiday/Maintenance)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Tagline</label>
                <input
                  value={editFormData.tagline}
                  onChange={(e) => setEditFormData({ ...editFormData, tagline: e.target.value })}
                  placeholder="e.g. Delicious Gourmet Meals"
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-slate-800 dark:focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Replace Shop Logo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditLogo(e.target.files[0])}
                  className="hidden"
                  id="edit-logo-upload"
                />
                <label
                  htmlFor="edit-logo-upload"
                  className="flex items-center justify-between w-full p-2.5 rounded-lg border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer text-xs font-medium text-slate-700 dark:text-zinc-300"
                >
                  <span>{editLogo ? editLogo.name : 'Choose New Logo File'}</span>
                  <span className="text-[10px] text-slate-900 dark:text-amber-400 uppercase font-bold">Browse</span>
                </label>
              </div>

              {/* INTEGRATED EXISTING MENU GALLERY DISPLAY & DELETER */}
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-amber-500 block">Existing Menu Pages</label>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                    {editingRestaurant.menu_images ? JSON.parse(editingRestaurant.menu_images).length : 0} uploaded
                  </span>
                </div>

                {editingRestaurant.menu_images && JSON.parse(editingRestaurant.menu_images).length > 0 ? (
                  <div className="grid grid-cols-3 gap-2.5 mb-3">
                    {JSON.parse(editingRestaurant.menu_images).map((imgUrl, idx) => (
                      <div key={idx} className="relative group rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden p-1">
                        <img src={`${backendUrl}${imgUrl}`} alt={`menu-${idx}`} className="h-28 w-full object-cover rounded" />
                        <div className="mt-1 flex items-center justify-between px-1">
                          <span className="text-[9px] font-mono text-slate-500 dark:text-zinc-400">P. {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteMenuImage(imgUrl, editingRestaurant)}
                            className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-zinc-500 italic mb-3">No existing menu images uploaded for this outlet.</p>
                )}

                {/* ADD / APPEND NEW MENU IMAGES OPTION */}
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">Upload / Append New Menu Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setEditMenuFiles(e.target.files)}
                  className="hidden"
                  id="edit-menu-files-upload"
                />
                <label
                  htmlFor="edit-menu-files-upload"
                  className="flex flex-col items-center justify-center w-full h-20 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-all text-xs font-medium text-slate-600 dark:text-zinc-300"
                >
                  <span>
                    {editMenuFiles.length > 0 ? `Selected ${editMenuFiles.length} New Menu Images` : 'Click to select new menu image files'}
                  </span>
                </label>
              </div>

              <div className="mt-6 flex gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 dark:border-zinc-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-slate-900 dark:bg-amber-500 py-2.5 text-xs font-bold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors shadow-subtle disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Update Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE MENU GALLERY MODAL */}
      {showMenuModal && managingRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-modal">
            <div className="mb-5 pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Menu Gallery</h2>
                <p className="text-xs text-slate-500 dark:text-amber-500 font-semibold">{managingRestaurant.name}</p>
              </div>
              <button
                onClick={() => setShowMenuModal(false)}
                className="text-xs font-bold text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            {/* Current Menu Gallery Grid */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Current Menu Pages</p>
              {managingRestaurant.menu_images && JSON.parse(managingRestaurant.menu_images).length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {JSON.parse(managingRestaurant.menu_images).map((imgUrl, idx) => (
                    <div key={idx} className="relative group rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden p-1">
                      <img src={`${backendUrl}${imgUrl}`} alt={`menu-${idx}`} className="h-32 w-full object-cover rounded" />
                      <button
                        onClick={() => handleDeleteMenuImage(imgUrl, managingRestaurant)}
                        className="absolute top-2 right-2 rounded bg-rose-600 hover:bg-rose-700 text-white px-1.5 py-0.5 text-[10px] font-semibold shadow-sm transition-transform hover:scale-105"
                        title="Delete image"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
                  No menu images uploaded yet for this outlet.
                </div>
              )}
            </div>

            {/* Add New Menu Images Form */}
            <form onSubmit={handleUploadNewMenuImages} className="border-t border-slate-100 dark:border-zinc-800 pt-5 space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Upload Additional Menu Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setNewMenuFiles(e.target.files)}
                className="hidden"
                id="add-menu-files"
              />
              <label
                htmlFor="add-menu-files"
                className="flex flex-col items-center justify-center w-full h-24 rounded-lg border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-all text-xs font-medium text-slate-600 dark:text-zinc-300"
              >
                <span>{newMenuFiles.length > 0 ? `${newMenuFiles.length} New Images Selected` : 'Click to select image files'}</span>
              </label>

              <button
                type="submit"
                disabled={newMenuFiles.length === 0 || isSubmitting}
                className="w-full rounded-lg bg-slate-900 dark:bg-amber-500 py-2.5 text-xs font-bold text-white dark:text-black disabled:opacity-40 hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors shadow-subtle"
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
