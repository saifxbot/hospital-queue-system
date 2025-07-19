import React, { useState, useRef, useEffect } from "react";
import api from "../../api/api";

function MedicalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      message: "👋 Hello! I'm your Medical Assistant. I can help you with:\n\n🩺 Find solutions for health symptoms\n👨‍⚕️ Locate doctors by name or specialization\n📅 General health guidance\n\nHow can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch doctors data for chatbot knowledge
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/api/doctor/");
        setDoctors(response.data);
      } catch (err) {
        console.log("Could not fetch doctors for chatbot");
      }
    };
    fetchDoctors();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Medical conditions and recommendations database
  const medicalKnowledge = {
    "fever": {
      symptoms: ["high temperature", "chills", "sweating", "headache"],
      advice: "Rest, drink plenty of fluids, take fever reducers like paracetamol. Consult a doctor if fever persists over 3 days or exceeds 103°F.",
      doctor: "General Medicine"
    },
    "headache": {
      symptoms: ["head pain", "migraine", "tension headache"],
      advice: "Rest in a dark, quiet room. Stay hydrated. Apply cold/warm compress. Avoid triggers like stress and certain foods.",
      doctor: "Neurology or General Medicine"
    },
    "chest pain": {
      symptoms: ["chest discomfort", "heart pain", "breathing difficulty"],
      advice: "⚠️ URGENT: Seek immediate medical attention if experiencing chest pain, especially with shortness of breath, sweating, or arm pain.",
      doctor: "Cardiology - EMERGENCY"
    },
    "stomach pain": {
      symptoms: ["abdominal pain", "stomach ache", "belly pain"],
      advice: "Avoid solid foods temporarily. Try clear liquids, rest. Avoid spicy/fatty foods. See a doctor if pain is severe or persistent.",
      doctor: "Gastroenterology or General Medicine"
    },
    "cold": {
      symptoms: ["runny nose", "cough", "sneezing", "sore throat"],
      advice: "Rest, drink warm fluids, use humidifier. Gargle with salt water. Usually resolves in 7-10 days.",
      doctor: "General Medicine"
    },
    "diabetes": {
      symptoms: ["high blood sugar", "frequent urination", "excessive thirst"],
      advice: "Monitor blood sugar regularly, maintain healthy diet, exercise regularly. Take medications as prescribed.",
      doctor: "Endocrinology"
    },
    "hypertension": {
      symptoms: ["high blood pressure", "dizziness", "headaches"],
      advice: "Reduce salt intake, exercise regularly, manage stress, take medications as prescribed. Monitor BP regularly.",
      doctor: "Cardiology"
    },
    "anxiety": {
      symptoms: ["worry", "nervousness", "panic", "stress"],
      advice: "Practice deep breathing, meditation, regular exercise. Avoid caffeine. Consider counseling or therapy.",
      doctor: "Psychiatry or Psychology"
    }
  };

  const findDoctorByName = (name) => {
    return doctors.filter(doctor => 
      doctor.name.toLowerCase().includes(name.toLowerCase())
    );
  };

  const findDoctorBySpecialty = (specialty) => {
    return doctors.filter(doctor => 
      doctor.specialization.toLowerCase().includes(specialty.toLowerCase())
    );
  };

  const analyzeMedicalQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Check if user is asking for a specific doctor
    if (lowerQuery.includes("doctor") || lowerQuery.includes("dr")) {
      // Extract potential doctor name
      const words = query.split(" ");
      const doctorResults = [];
      
      words.forEach(word => {
        const matches = findDoctorByName(word);
        doctorResults.push(...matches);
      });
      
      if (doctorResults.length > 0) {
        return {
          type: "doctor_search",
          results: [...new Set(doctorResults)] // Remove duplicates
        };
      }
    }

    // Check for medical conditions
    for (const [condition, data] of Object.entries(medicalKnowledge)) {
      if (lowerQuery.includes(condition) || 
          data.symptoms.some(symptom => lowerQuery.includes(symptom))) {
        return {
          type: "medical_advice",
          condition: condition,
          data: data
        };
      }
    }

    // Check for specialty search
    const specialties = ["cardiology", "pediatrics", "general medicine", "neurology", "gastroenterology", "endocrinology", "psychiatry"];
    for (const specialty of specialties) {
      if (lowerQuery.includes(specialty)) {
        const specialtyDoctors = findDoctorBySpecialty(specialty);
        if (specialtyDoctors.length > 0) {
          return {
            type: "specialty_search",
            specialty: specialty,
            results: specialtyDoctors
          };
        }
      }
    }

    return { type: "general" };
  };

  const generateBotResponse = (query) => {
    const analysis = analyzeMedicalQuery(query);

    switch (analysis.type) {
      case "doctor_search":
        return `👨‍⚕️ I found these doctors:\n\n${analysis.results.map(doc => 
          `• Dr. ${doc.name} - ${doc.specialization}\n  📍 ${doc.chamber || 'Chamber info not available'}\n  📞 ${doc.phone || 'Contact info not available'}`
        ).join('\n\n')}`;

      case "specialty_search":
        return `🩺 ${analysis.specialty.charAt(0).toUpperCase() + analysis.specialty.slice(1)} specialists:\n\n${analysis.results.map(doc => 
          `• Dr. ${doc.name}\n  📍 ${doc.chamber || 'Chamber info not available'}\n  📅 ${doc.available_days || 'Schedule not available'}`
        ).join('\n\n')}`;

      case "medical_advice":
        const { condition, data } = analysis;
        return `🩺 About ${condition.charAt(0).toUpperCase() + condition.slice(1)}:\n\n💡 Advice: ${data.advice}\n\n👨‍⚕️ Recommended specialist: ${data.doctor}\n\n⚠️ Note: This is general guidance. Always consult a healthcare professional for proper diagnosis and treatment.`;

      default:
        return `🤖 I'm here to help with medical questions and doctor searches. Try asking about:\n\n• Symptoms like "I have a headache" or "chest pain"\n• Finding doctors: "Find Dr. Smith" or "cardiology doctors"\n• Health conditions: "diabetes care" or "fever treatment"\n\nWhat would you like to know?`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: "user",
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      const botMessage = {
        type: "bot",
        message: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div 
        className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '❌' : '🩺'}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="chatbot-icon">🩺</span>
              Medical Assistant
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-content">
                  {msg.message.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-content typing">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask about symptoms, find doctors..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              📤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MedicalChatbot;
