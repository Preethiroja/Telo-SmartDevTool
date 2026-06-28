import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { RiUserLine, RiMailLine, RiBuildingLine, RiCodeLine, RiCheckLine, RiLoader4Line } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, loadUser } = useAuth()
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    company: user?.company || '',
    role: user?.role || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/auth/me', form)
      await loadUser()
      setSaved(true)
      toast.success('Profile updated successfully')
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const planColors = { free: 'bg-gray-100 text-gray-600', pro: 'bg-teal-100 text-teal-700', team: 'bg-violet-100 text-violet-700' }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-900 mb-1">Profile</h1>
        <p className="text-sm text-gray-500">Manage your account details and preferences</p>
      </motion.div>

      {/* Avatar + Plan */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl font-bold font-poppins shadow-lg flex-shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-bold font-poppins text-gray-900">{user?.fullName}</h2>
          <p className="text-gray-500 text-sm mb-2">{user?.email}</p>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${planColors[user?.plan] || planColors.free}`}>
            {(user?.plan || 'free').toUpperCase()} PLAN
          </span>
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
        <h3 className="font-semibold font-poppins text-gray-900 mb-5">Personal information</h3>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: 'Full name', field: 'fullName', icon: RiUserLine, placeholder: 'Your full name' },
            { label: 'Company', field: 'company', icon: RiBuildingLine, placeholder: 'Your company (optional)' },
            { label: 'Role', field: 'role', icon: RiCodeLine, placeholder: 'e.g. Backend Engineer' },
          ].map(({ label, field, icon: Icon, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                  placeholder={placeholder} className="input-field pl-10" />
              </div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <div className="relative">
              <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input value={user?.email || ''} disabled className="input-field pl-10 bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <motion.button type="submit" disabled={saving}
            whileHover={!saving ? { scale: 1.01 } : {}} whileTap={!saving ? { scale: 0.99 } : {}}
            className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {saving ? <><RiLoader4Line className="animate-spin" size={16} /> Saving...</>
              : saved ? <><RiCheckLine size={16} className="text-white" /> Saved!</>
              : 'Save changes'}
          </motion.button>
        </form>
      </motion.div>

      {/* Account stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <h3 className="font-semibold font-poppins text-gray-900 mb-4">Account details</h3>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
            { label: 'Last login', value: user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'This session' },
            { label: 'Account status', value: user?.isActive ? '✅ Active' : '⚠️ Inactive' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
