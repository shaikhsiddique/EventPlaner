import React from 'react'

function Footer() {
  return (
    <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <div className="footer-brand">
            <div className="footer-logo"></div>
            <span className="footer-brand-name">EventHub</span>
          </div>
          <p className="footer-tagline">Smart event management for educational institutions.</p>
        </div>
        <div className="footer-links-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-link-list">
            <li><a href="#" className="footer-link">About</a></li>
            <li><a href="#" className="footer-link">Contact</a></li>
            <li><a href="#" className="footer-link">Support</a></li>
          </ul>
        </div>
        <div className="footer-contact-col">
          <h4 className="footer-col-title">Contact</h4>
          <p className="footer-contact-info">info@eventhub.edu</p>
          <p className="footer-contact-info">+1 (555) 123-4567</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">&copy; 2025 EventHub. All rights reserved.</p>
      </div>
    </div>
  </footer>
  )
}

export default Footer