import React from 'react'
import { Link } from 'react-router-dom'
import { RiGithubLine, RiTwitterLine, RiLinkedinLine } from 'react-icons/ri'
import TeloLogo from '../ui/TeloLogo'

export default function Footer() {
  const year = new Date().getFullYear()

  const links = {
    Product: ['Features', 'Changelog', 'Roadmap'],
    Developers: ['Documentation', 'API Reference', 'SDKs', 'Status'],
    Company: ['About', 'Blog', 'Careers', 'Contact'],
    Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
  }

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="container-max section-padding py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <TeloLogo size={32} textSize="text-xl" className="mb-4" />
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Transform any API documentation into production-ready code in seconds using advanced AI.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: RiGithubLine, href: '#' },
                { icon: RiTwitterLine, href: '#' },
                { icon: RiLinkedinLine, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all duration-200"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {section}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 hover:text-teal-600 transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {year} Telo. Built for developers, by developers.
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <span>Made with</span>
            <span className="text-teal-500">♥</span>
            <span>and AI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
