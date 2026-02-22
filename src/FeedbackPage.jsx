// FeedbackPage.jsx (LIVE)
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./FeedbackPage.css";

const translations = {
  vi: { goodBtn:"👍 Có", badBtn:"👎 Không", emailPlaceholder:"Email của bạn", contentPlaceholder:"Chia sẻ trải nghiệm...", nextBtn:"Tiếp theo", sendBtn:"Gửi cảm nhận", emailError:"Email không hợp lệ", contentError:"Vui lòng nhập nội dung góp ý", popupTitle:"Cảm ơn bạn đã góp ý!", popupSubtitle:"Chúng tôi sẽ cải thiện dịch vụ tốt hơn", badTitle:"Chúng tôi muốn cải thiện tốt hơn", goodTitle:"🎉 Tuyệt vời!" },
  en: { goodBtn:"👍 Yes", badBtn:"👎 No", emailPlaceholder:"Your email", contentPlaceholder:"Share your experience...", nextBtn:"Next", sendBtn:"Send Feedback", emailError:"Invalid email", contentError:"Please enter feedback", popupTitle:"Thanks for your feedback!", popupSubtitle:"We will improve our service.", badTitle:"We want to improve", goodTitle:"🎉 Great!" },
  ja: { goodBtn:"👍 はい", badBtn:"👎 いいえ", emailPlaceholder:"メール", contentPlaceholder:"体験を共有してください...", nextBtn:"次へ", sendBtn:"感想を送る", emailError:"有効なメールアドレスを入力してください", contentError:"フィードバックを入力してください", popupTitle:"ご意見ありがとうございます！", popupSubtitle:"サービスを改善いたします。", badTitle:"改善したい点があります", goodTitle:"🎉 素晴らしい!" },
  zh: { goodBtn:"👍 是", badBtn:"👎 否", emailPlaceholder:"你的邮箱", contentPlaceholder:"分享你的体验...", nextBtn:"下一步", sendBtn:"发送反馈", emailError:"无效的邮箱", contentError:"请输入反馈", popupTitle:"感谢您的反馈！", popupSubtitle:"我们将改进服务。", badTitle:"我们希望改进", goodTitle:"🎉 太棒了！" },
  ko: { goodBtn:"👍 예", badBtn:"👎 아니요", emailPlaceholder:"이메일", contentPlaceholder:"경험을 공유하세요...", nextBtn:"다음", sendBtn:"피드백 보내기", emailError:"유효한 이메일을 입력하세요", contentError:"피드백을 입력해주세요", popupTitle:"피드백 감사합니다!", popupSubtitle:"서비스를 개선하겠습니다.", badTitle:"개선하고 싶습니다", goodTitle:"🎉 훌륭합니다!" },
};

export default function FeedbackPage() {
  const { ownerId } = useParams();
  const [lang, setLang] = useState("en");
  const [service, setService] = useState(null);
  const [selected, setSelected] = useState(null); // "good" | "bad"
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState("");
  const [stars, setStars] = useState(1);
  const [showThanks, setShowThanks] = useState(false);

  useEffect(() => {
    const userLang = navigator.language || navigator.userLanguage;
    if(userLang.startsWith("vi")) setLang("vi");
    else if(userLang.startsWith("ja")) setLang("ja");
    else if(userLang.startsWith("zh")) setLang("zh");
    else if(userLang.startsWith("ko")) setLang("ko");
    else setLang("en");
  }, []);

  const t = translations[lang];

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`https://feedback-pcs.com/api/business/${ownerId}`);
        if(!res.ok) throw new Error("Service not found");
        const data = await res.json();
        if(!data.serviceActive) throw new Error("Service inactive");
        setService(data);
      } catch(err) {
        console.error(err);
        setService({ inactive: true });
      }
    };
    fetchService();
  }, [ownerId]);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v);

  const handleEmailChange = (v) => {
    setEmail(v);
    setEmailError(validateEmail(v) ? "" : t.emailError);
  };
  const handleContentChange = (v) => {
    setContent(v);
    setContentError(v.trim() ? "" : t.contentError);
  };

  const handleChoose = (type) => {
    setSelected(type);
    setStars(1);
    setContent("");
    setEmail("");
    setEmailError("");
    setContentError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if(!validateEmail(email)) {
      setEmailError(t.emailError);
      return;
    }
    if(selected === "bad" && !content.trim()) {
      setContentError(t.contentError);
      return;
    }

    try {
      const res = await fetch(`https://feedback-pcs.com/api/feedback`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          slug: ownerId,
          rating: selected === "bad" ? stars : 5,
          comment: selected === "good" ? "Positive feedback" : content,
          email: email
        })
      });
      if(!res.ok) throw new Error("API error");
      if(selected === "good") {
      // Redirect người dùng sau khi gửi good feedback
      window.location.href = "https://google.com"; // hoặc lấy từ service.redirectUrl nếu admin cấu hình
      } else {
        // Popup cảm ơn cho bad feedback
        setShowThanks(true);
      }
      setEmail(""); setContent(""); setStars(1); setSelected(null);
      window.scrollTo({ top:0, behavior:"smooth" });
    } catch(err) {
      console.error(err);
      alert("API error");
    }
  };

  if(!service) return <div className="feedback-loading">Loading...</div>;
  if(service.inactive) return <div className="feedback-404">🚫 404 error.</div>;

  const disableGood = !validateEmail(email);
  const disableBad = !validateEmail(email) || !content.trim();

  return (
    <div className="feedback-page">
      {/* Service Card */}
      <div className="service-card" style={{backgroundImage: service.bgImg ? `url(${service.bgImg})`:"none"}}>
        <div className="logo-wrapper">
          {service.logo ? <img src={service.logo} alt="Logo" className="logo"/> : <div className="logo-placeholder">Logo</div>}
        </div>
        <h2 className="service-name">{service.name || "Tên dịch vụ"}</h2>
      </div>

      {/* Feedback Choice */}
      {!selected && (
        <div className="feedback-card">
          <h2 className="feedback-title">{service.feedbackTitle || "Đánh giá dịch vụ"}</h2>
          <p className="feedback-subtitle">{service.feedbackSubtitle || "Bạn cảm thấy dịch vụ thế nào?"}</p>
          <div className="feedback-row">
            <button className={`bad-btn ${selected==="bad"?"active":""}`} onClick={()=>handleChoose("bad")}>{t.badBtn}</button>
            <button className={`good-btn ${selected==="good"?"active":""}`} onClick={()=>handleChoose("good")}>{t.goodBtn}</button>
          </div>
        </div>
      )}

      {/* GOOD Feedback */}
      {selected==="good" && (
        <div className="feedback-card">
          <h3 className="good-title">{t.goodTitle}</h3>
          <input placeholder={t.emailPlaceholder} value={email} onChange={e=>handleEmailChange(e.target.value)} className={`input-field ${emailError?"input-error":""}`} />
          {emailError && <p className="error-text">{emailError}</p>}
          <button className="primary-btn" disabled={disableGood} onClick={handleSubmit}>{t.nextBtn}</button>
        </div>
      )}

      {/* BAD Feedback */}
      {selected==="bad" && (
        <div className="feedback-card">
          <h3 className="bad-title">{t.badTitle}</h3>
          <div className="stars-row">
            {[1,2,3,4,5].map(n=>(
              <span key={n} onClick={()=>setStars(n)} className={`star ${n<=stars?"active":"inactive"}`}>★</span>
            ))}
          </div>
          <input placeholder={t.emailPlaceholder} value={email} onChange={e=>handleEmailChange(e.target.value)} className={`input-field ${emailError?"input-error":""}`} />
          {emailError && <p className="error-text">{emailError}</p>}
          <textarea placeholder={t.contentPlaceholder} value={content} onChange={e=>handleContentChange(e.target.value)} className={`input-field ${contentError?"input-error":""}`} style={{height:100}}/>
          {contentError && <p className="error-text">{contentError}</p>}
          <button className="primary-btn" disabled={disableBad} onClick={handleSubmit}>{t.sendBtn}</button>
        </div>
      )}

      {/* Popup Thanks */}
      {showThanks && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>{t.popupTitle}</h3>
            <p>{t.popupSubtitle}</p>
            <button className="primary-btn" onClick={()=>setShowThanks(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}