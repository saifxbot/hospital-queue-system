import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="fade-in">
      <div className="home-hero">
        <h1>🏥 HealthCare Excellence Hospital</h1>
        <p>Leading the Future of Digital Healthcare Management</p>
        <p>Where Technology Meets Compassionate Care</p>
        
        <div className="mt-2">
          <Link to="/doctors" className="dashboard-card a" style={{ 
            display: "inline-block", 
            textDecoration: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "0.75rem 2rem",
            borderRadius: "25px",
            fontWeight: "600",
            margin: "0.5rem"
          }}>
            👨‍⚕️ Meet Our Expert Doctors
          </Link>
        </div>
      </div>

      {/* About Hospital Section */}
      <div className="hospital-about">
        <div className="about-content">
          <h2>🌟 About Our Hospital</h2>
          <p className="about-intro">
            HealthCare Excellence Hospital has been serving the community for over <strong>25 years</strong>, 
            providing world-class medical care with cutting-edge technology and compassionate service. 
            Our state-of-the-art digital queue management system ensures efficient, hassle-free healthcare 
            experience for all our patients.
          </p>
          
          <div className="about-highlights">
            <div className="highlight-item">
              <h4>🎯 Our Mission</h4>
              <p>To provide accessible, high-quality healthcare services through innovative technology 
              and dedicated medical professionals, ensuring every patient receives personalized care 
              in a comfortable and efficient environment.</p>
            </div>
            
            <div className="highlight-item">
              <h4>👁️ Our Vision</h4>
              <p>To be the leading healthcare institution that seamlessly integrates advanced medical 
              technology with human-centered care, setting new standards for patient experience 
              and medical excellence.</p>
            </div>
            
            <div className="highlight-item">
              <h4>💝 Our Values</h4>
              <p>Compassion, Excellence, Innovation, Integrity, and Patient-First approach guide 
              everything we do. We believe in treating every patient like family while maintaining 
              the highest standards of medical care.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="achievements-section">
        <h2>🏆 Our Achievements & Recognition</h2>
        <div className="achievements-grid">
          <div className="achievement-card">
            <div className="achievement-icon">🥇</div>
            <h4>Best Healthcare Innovation 2024</h4>
            <p>Awarded for our revolutionary digital queue management system that reduced patient waiting time by 60%</p>
          </div>
          
          <div className="achievement-card">
            <div className="achievement-icon">⭐</div>
            <h4>5-Star Patient Satisfaction</h4>
            <p>Consistently rated 5 stars by patients for exceptional care quality and service excellence</p>
          </div>
          
          <div className="achievement-card">
            <div className="achievement-icon">🎖️</div>
            <h4>Medical Excellence Award</h4>
            <p>Recognized by the National Healthcare Board for outstanding medical outcomes and patient safety</p>
          </div>
          
          <div className="achievement-card">
            <div className="achievement-icon">🌍</div>
            <h4>Community Service Recognition</h4>
            <p>Honored for providing free healthcare services to underprivileged communities for 10+ years</p>
          </div>
          
          <div className="achievement-card">
            <div className="achievement-icon">🔬</div>
            <h4>Research Pioneer</h4>
            <p>Leading 15+ clinical research studies contributing to medical advancements globally</p>
          </div>
          
          <div className="achievement-card">
            <div className="achievement-icon">💚</div>
            <h4>Green Hospital Certification</h4>
            <p>Certified as an eco-friendly hospital with sustainable healthcare practices</p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <h2>📊 Our Impact in Numbers</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">150,000+</div>
            <div className="stat-label">Patients Served Annually</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Expert Doctors</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">25+</div>
            <div className="stat-label">Medical Specialties</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Patient Satisfaction Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Emergency Services</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">300+</div>
            <div className="stat-label">Beds Capacity</div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="services-section">
        <h2>🏥 Our Medical Specialties</h2>
        <div className="services-grid">
          <div className="service-item">
            <div className="service-icon">❤️</div>
            <h4>Cardiology</h4>
            <p>Advanced heart care with state-of-the-art cardiac procedures and interventions</p>
          </div>
          <div className="service-item">
            <div className="service-icon">🧠</div>
            <h4>Neurology</h4>
            <p>Comprehensive brain and nervous system treatment with cutting-edge technology</p>
          </div>
          <div className="service-item">
            <div className="service-icon">🦴</div>
            <h4>Orthopedics</h4>
            <p>Expert bone, joint, and muscle care including minimally invasive surgeries</p>
          </div>
          <div className="service-item">
            <div className="service-icon">👶</div>
            <h4>Pediatrics</h4>
            <p>Specialized care for children from infancy through adolescence</p>
          </div>
          <div className="service-item">
            <div className="service-icon">👁️</div>
            <h4>Ophthalmology</h4>
            <p>Advanced eye care including laser surgeries and retinal treatments</p>
          </div>
          <div className="service-item">
            <div className="service-icon">🫁</div>
            <h4>Pulmonology</h4>
            <p>Comprehensive respiratory and lung care with modern diagnostic tools</p>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="technology-section">
        <h2>💻 Digital Innovation</h2>
        <div className="tech-content">
          <p>
            Our hospital is at the forefront of healthcare technology, offering a seamless digital 
            experience that puts patients first. Our innovative queue management system eliminates 
            long waiting times and provides real-time updates on appointment status.
          </p>
          
          <div className="tech-features">
            <div className="tech-feature">
              <div className="tech-icon">📱</div>
              <h4>Smart Queue System</h4>
              <p>Real-time appointment tracking and queue management</p>
            </div>
            <div className="tech-feature">
              <div className="tech-icon">�</div>
              <h4>AI Medical Assistant</h4>
              <p>24/7 chatbot for medical queries and doctor recommendations</p>
            </div>
            <div className="tech-feature">
              <div className="tech-icon">📊</div>
              <h4>Digital Health Records</h4>
              <p>Secure, accessible patient records and medical history</p>
            </div>
            <div className="tech-feature">
              <div className="tech-icon">💳</div>
              <h4>Contactless Payments</h4>
              <p>Safe and convenient digital payment options</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard">
        <div className="dashboard-card">
          <div className="medical-icon">👨‍⚕️</div>
          <h3>For Patients</h3>
          <p>Book appointments with your preferred doctors, view your medical schedule, and manage your healthcare efficiently through our smart digital platform.</p>
          <Link to="/doctors">Browse Our Doctors</Link>
        </div>
        
        <div className="dashboard-card">
          <div className="medical-icon">🩺</div>
          <h3>For Medical Professionals</h3>
          <p>Join our team of healthcare excellence. Manage patient appointments, access digital tools, and provide world-class medical care.</p>
          <Link to="/register">Join Our Team</Link>
        </div>
        
        <div className="dashboard-card">
          <div className="medical-icon">⚕️</div>
          <h3>For Hospital Administrators</h3>
          <p>Oversee hospital operations, manage resources efficiently, and ensure optimal patient care delivery through our comprehensive admin tools.</p>
          <Link to="/login">Admin Access</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;