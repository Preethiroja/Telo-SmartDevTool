import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  RiPaletteLine, RiTranslate2, RiBellLine, RiShieldLine,
  RiDeleteBinLine, RiLogoutBoxLine, RiCheckLine
} from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function ToggleSwitch({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-teal-500' : 'bg-gray-200'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [settings, setSettings] = useState({
    emailNotifications: true,
    analysisComplete: true,
    weeklyDigest: false,
    language: 'javascript',
    defaultLanguage: 'en',
    compactView: false,
    autoSave: true,
  })

  const [saved, setSaved] = useState(false)

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))

  const saveSettings = () => {
    localStorage.setItem('telo_settings', JSON.stringify(settings))
    setSaved(true)
    toast.success('Settings saved')
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const Section = ({ title, desc, children }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6 mb-4">
      <div className="mb-5">
        <h3 className="font-semibold font-poppins text-gray-900">{title}</h3>
        {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
      </div>
      {children}
    </motion.div>
  )

  const Row = ({ label, desc, children }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {desc && <div className="text-xs text-gray-400 mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  )

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold font-poppins text-gray-900 mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Customize your Telo experience</p>
      </motion.div>

      {/* Defaults */}
      <Section title="Code generation defaults" desc="Set your preferred output when generating code">
        <Row label="Default language" desc="Language used when not specified">
          <select value={settings.language} onChange={e => update('language', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-100 outline-none">
            <option value="javascript">🟨 JavaScript</option>
            <option value="python">🐍 Python</option>
            <option value="java">☕ Java</option>
          </select>
        </Row>
        <Row label="Auto-save projects" desc="Automatically save analysis results">
          <ToggleSwitch checked={settings.autoSave} onChange={v => update('autoSave', v)} />
        </Row>
        <Row label="Compact view" desc="Show more content in less space">
          <ToggleSwitch checked={settings.compactView} onChange={v => update('compactView', v)} />
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" desc="Control when Telo sends you emails">
        <Row label="Email notifications" desc="Receive email updates from Telo">
          <ToggleSwitch checked={settings.emailNotifications} onChange={v => update('emailNotifications', v)} />
        </Row>
        <Row label="Analysis complete" desc="Notify when API analysis finishes">
          <ToggleSwitch checked={settings.analysisComplete} onChange={v => update('analysisComplete', v)} />
        </Row>
        <Row label="Weekly digest" desc="Summary of your weekly usage">
          <ToggleSwitch checked={settings.weeklyDigest} onChange={v => update('weeklyDigest', v)} />
        </Row>
      </Section>

      {/* Save */}
      <motion.button onClick={saveSettings} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        className="btn-primary w-full justify-center py-3 mb-4">
        {saved ? <><RiCheckLine size={16} /> Saved!</> : 'Save settings'}
      </motion.button>

      {/* Danger zone */}
      <Section title="Account" desc="Account-level actions">
        <Row label="Sign out" desc="Log out of your Telo account">
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all border border-gray-200 hover:border-red-200">
            <RiLogoutBoxLine size={15} /> Logout
          </button>
        </Row>
        <Row label="Delete account" desc="Permanently delete your account and all data">
          <button
            onClick={() => toast.error('Contact support to delete your account')}
            className="flex items-center gap-2 text-sm text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all border border-red-200">
            <RiDeleteBinLine size={15} /> Delete account
          </button>
        </Row>
      </Section>
    </div>
  )
}
