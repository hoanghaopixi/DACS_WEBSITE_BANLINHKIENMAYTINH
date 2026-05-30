import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaTimes, FaPaperPlane, FaChevronDown } from 'react-icons/fa';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'BOT', text: 'Chào bạn! Mình là Trợ lý ảo HHPC của cửa hàng. Bạn cần tư vấn linh kiện hay build PC hôm nay?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now(), sender: 'USER', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      // Gửi JWT token nếu đã đăng nhập để backend nhận diện user
      const raw = localStorage.getItem('pc_store_auth_user');
      if (raw) {
        try {
          const user = JSON.parse(raw);
          if (user && user.accessToken) {
            headers['Authorization'] = `Bearer ${user.accessToken}`;
          }
        } catch (e) {}
      }

      const response = await fetch('http://localhost:8080/api/chat/message', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMsg.text, sessionId: sessionId })
      });
      const data = await response.json();
      if (data.sessionId) setSessionId(data.sessionId);
      
      const botMsg = { 
        id: Date.now() + 1, 
        sender: 'BOT', 
        text: data.replyText,
        products: data.suggestedProducts
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const botMsg = { 
        id: Date.now() + 1, 
        sender: 'BOT', 
        text: 'Lỗi kết nối tới AI. Vui lòng thử lại sau.'
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessage = (text) => {
    if (!text) return { __html: '' };
    let safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    safeText = safeText.replace(/\*(.*?)\*/g, "<em>$1</em>");
    safeText = safeText.replace(/\n/g, "<br/>");
    return { __html: safeText };
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className={`chat-widget-container ${isOpen ? 'open' : ''}`}>
      <button 
        className={`chat-toggle-btn pulse-animation ${isOpen ? 'hide-btn' : ''}`} 
        onClick={() => setIsOpen(true)}
      >
        <FaRobot size={24} />
      </button>

      <div className={`chat-window ${isOpen ? 'show' : 'hide'}`}>
        <div className="chat-header">
            <div className="chat-header-info">
              <div className="bot-avatar"><FaRobot /></div>
              <div>
                <h4>Trợ lý ảo HHPC</h4>
                <span className="status-online">Online</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FaChevronDown />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-wrapper ${msg.sender === 'USER' ? 'user' : 'bot'}`}>
                {msg.sender === 'BOT' && <div className="msg-avatar"><FaRobot /></div>}
                <div className="message-content">
                  <div className="message-bubble" dangerouslySetInnerHTML={formatMessage(msg.text)} />
                  {msg.products && msg.products.length > 0 && (
                    <div className="carousel-container">
                      {msg.products.length > 1 && (
                        <button className="carousel-btn left" onClick={(e) => {
                          e.target.nextElementSibling.scrollBy({ left: -240, behavior: 'smooth' });
                        }}>&#8249;</button>
                      )}
                      <div className="product-carousel">
                        {msg.products.map(prod => (
                          <div key={prod.id || prod.productId} className="chat-product-card">
                            <img src={prod.image} alt={prod.name} />
                            <div className="chat-product-info">
                              <h5>{prod.name}</h5>
                              <span className="price">{(prod.price || 0).toLocaleString('vi-VN')}đ</span>
                              <button className="btn-view-detail" onClick={() => navigate(`/products/${prod.productId}`)}>Xem chi tiết</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {msg.products.length > 1 && (
                        <button className="carousel-btn right" onClick={(e) => {
                          e.target.previousElementSibling.scrollBy({ left: 240, behavior: 'smooth' });
                        }}>&#8250;</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message-wrapper bot">
                <div className="msg-avatar"><FaRobot /></div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              placeholder="Nhập câu hỏi (VD: Tư vấn PC 20 triệu)..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="send-btn" onClick={handleSend} disabled={!inputValue.trim()}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
    </div>
  );
};

export default ChatWidget;
