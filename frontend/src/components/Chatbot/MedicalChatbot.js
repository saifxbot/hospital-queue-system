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
    const searchTerms = name.toLowerCase().split(' ').filter(term => term.length > 2);
    
    return doctors.filter(doctor => {
      const doctorName = doctor.name.toLowerCase();
      // Check if all search terms are found in the doctor's name
      return searchTerms.every(term => doctorName.includes(term)) || 
             // Or if any search term matches a word in the doctor's name
             searchTerms.some(term => doctorName.split(' ').some(word => word.includes(term)));
    });
  };

  const findDoctorBySpecialty = (specialty) => {
    return doctors.filter(doctor => 
      doctor.specialization.toLowerCase().includes(specialty.toLowerCase())
    );
  };

  const analyzeMedicalQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Check if user is asking for a specific doctor
    if (lowerQuery.includes("find") && (lowerQuery.includes("doctor") || lowerQuery.includes("dr"))) {
      // Extract doctor name from queries like "find Dr. Smith" or "find doctor John"
      let doctorName = "";
      
      // Try to extract name after "dr." or "doctor"
      const drMatch = query.match(/(?:dr\.?\s+|doctor\s+)([a-zA-Z\s]+)/i);
      if (drMatch) {
        doctorName = drMatch[1].trim();
      } else {
        // Try to extract name after "find"
        const findMatch = query.match(/find\s+([a-zA-Z\s]+)/i);
        if (findMatch) {
          doctorName = findMatch[1].replace(/\b(doctor|dr\.?)\b/gi, '').trim();
        }
      }
      
      if (doctorName) {
        const doctorResults = findDoctorByName(doctorName);
        if (doctorResults.length > 0) {
          return {
            type: "doctor_search",
            searchTerm: doctorName,
            results: doctorResults
          };
        } else {
          return {
            type: "doctor_not_found",
            searchTerm: doctorName
          };
        }
      }
    }
    
    // Check if user is asking for doctors by specialty
    if (lowerQuery.includes("doctor") || lowerQuery.includes("specialist")) {
      const specialties = [
        "cardiology", "pediatrics", "general medicine", "neurology", 
        "gastroenterology", "endocrinology", "psychiatry", "orthopedics",
        "dermatology", "gynecology", "urology", "oncology", "hematology"
      ];
      
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

    return { type: "general" };
  };

  const generateBotResponse = (query) => {
    const analysis = analyzeMedicalQuery(query);

    switch (analysis.type) {
      case "doctor_search":
        return `👨‍⚕️ I found ${analysis.results.length} doctor(s) matching "${analysis.searchTerm}":\n\n${analysis.results.map(doc => 
          `• Dr. ${doc.name} - ${doc.specialization}\n  📍 ${doc.chamber || 'Chamber info not available'}\n  📞 ${doc.phone || 'Contact info not available'}`
        ).join('\n\n')}`;
      
      case "doctor_not_found":
        return `❌ Sorry, I couldn't find any doctors matching "${analysis.searchTerm}". \n\n💡 Try:\n• Using just the last name (e.g., "find Dr. Smith")\n• Checking the spelling\n• Asking for a specialty instead (e.g., "cardiology doctors")\n\n🔍 You can also browse all available doctors by asking "show all doctors"`;

      case "specialty_search":
        return `🩺 ${analysis.specialty.charAt(0).toUpperCase() + analysis.specialty.slice(1)} specialists:\n\n${analysis.results.map(doc => 
          `• Dr. ${doc.name}\n  📍 ${doc.chamber || 'Chamber info not available'}\n  📅 ${doc.available_days || 'Schedule not available'}`
        ).join('\n\n')}`;

      case "medical_advice":
        const { condition, data } = analysis;
        return `🩺 About ${condition.charAt(0).toUpperCase() + condition.slice(1)}:\n\n💡 Advice: ${data.advice}\n\n👨‍⚕️ Recommended specialist: ${data.doctor}\n\n⚠️ Note: This is general guidance. Always consult a healthcare professional for proper diagnosis and treatment.`;

      default:
        // Check if user wants to see all doctors
        if (query.toLowerCase().includes("show all doctors") || query.toLowerCase().includes("list all doctors")) {
          return `👨‍⚕️ Here are all available doctors:\n\n${doctors.map(doc => 
            `• Dr. ${doc.name} - ${doc.specialization}`
          ).join('\n')}`;
        }
        
        return `🤖 I'm here to help with medical questions and doctor searches. Try asking about:\n\n• Find specific doctors: "find Dr. Smith" or "find Dr. Johnson"\n• Find specialists: "cardiology doctors" or "pediatric specialists"\n• Symptoms: "I have a headache" or "chest pain"\n• Health conditions: "diabetes care" or "fever treatment"\n• See all doctors: "show all doctors"\n\nWhat would you like to know?`;
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
