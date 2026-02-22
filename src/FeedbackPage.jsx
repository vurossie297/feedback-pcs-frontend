// FeedbackPage.jsx
import { useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./FeedbackPage.css";

const translations = {
  en: {
    goodBtn: "Good 👍",
    badBtn: "Bad 👎",
    goodTitle: "Thanks for your positive feedback!",
    badTitle: "Please tell us why you are unhappy",
    emailPlaceholder: "Enter your email",
    contentPlaceholder: "Write your feedback",
    nextBtn: "Next",
    sendBtn: "Send",
    popupTitle: "Thank you!",
    popupSubtitle: "Your feedback has been submitted.",
    emailError: "Invalid email",
    contentError: "Please enter feedback",
  },
  vi: {
    goodBtn: "Tốt 👍",
    badBtn: "Xấu 👎",
    goodTitle: "Cảm ơn đánh giá tích cực của bạn!",
    badTitle: "Hãy cho chúng tôi biết lý do bạn không hài lòng",
    emailPlaceholder: "Nhập email của bạn",
    contentPlaceholder: "Viết phản hồi của bạn",
    nextBtn: "Tiếp theo",
    sendBtn: "Gửi",
    popupTitle: "Cảm ơn!",
    popupSubtitle: "Phản hồi của bạn đã được gửi.",
    emailError: "Email không hợp lệ",
    contentError: "Vui lòng nhập phản hồi",
  },
  ja: { /* ...tương tự nếu cần */ },
  zh: { /* ... */ },
  ko: { /* ... */ },
};

export default function FeedbackPage({ ownerId: propOwnerId }) {
  const { ownerId: paramOwnerId } = useParams();
  const ownerId = propOwnerId || paramOwnerId;

  const [lang, setLang] = useState("en");
  const [selected, setSelected] = useState(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [stars, setStars] = useState(1);
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState("");
  const [showThanks, setShowThanks] = useState(false);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  const goodRef = useRef(null);
  const badRef = useRef(null);

  useEffect(() => {
    const userLang = navigator.language || navigator.userLanguage;
    if (userLang.startsWith("vi")) setLang("vi");
    else if (userLang.startsWith("ja")) setLang("ja");
    else if (userLang.startsWith("zh")) setLang("zh");
    else if (userLang.startsWith("ko")) setLang("ko");
    else setLang("en");
  }, []);

  const t = translations[lang];

  // =========================
  // Load owner/service info từ Worker API
  // =========================
  useEffect(() => {
    if (!ownerId) return;
    setLoading(true);

    fetch(`https://feedback-pcs-api.vurossie297.workers.dev/api/business/${ownerId}`)
      .then(res => {
        if (!res.ok) throw new Error("Owner not found");
        return res.json();
      })
      .then(data => {
        setService({
          ...data,
          serviceActive: data.serviceActive ?? false,
          feedbackTitle: "Đánh giá dịch vụ",
          feedbackSubtitle: "Bạn cảm thấy dịch vụ thế nào?",
        });
      })
      .catch(err => {
        console.error(err);
        setService(null);
      })
      .finally(() => setLoading(false));
  }, [ownerId]);

  if (loading)
    return (
      <div style={styles.fullScreen}>
        <div style={styles.centerBox}>Loading...</div>
      </div>
    );

  if (!service || !service.serviceActive) {
    return (
      <div style={styles.fullScreen}>
        <div style={styles.centerBox}>
          🚫 Dịch vụ chưa sẵn sàng hoặc 404
        </div>
      </div>
    );
  }

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value);
  const handleEmailChange = (value) => { setEmail(value); setEmailError(validateEmail(value)? "": t.emailError); };
  const handleContentChange = (value) => { setContent(value); setContentError(value.trim()? "": t.contentError); };
  const handleChoose = (type) => { setSelected(type); window.scrollTo({ top:0, behavior:"smooth" }); };

  const handleSubmit = async () => {
    if (!validateEmail(email)) { setEmailError(t.emailError); return; }
    if (selected === "bad" && !content.trim()) { setContentError(t.contentError); return; }

    try {
      const response = await fetch(
        "https://feedback-pcs-api.vurossie297.workers.dev/api/feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: ownerId,
            rating: selected==="bad"? stars : 5,
            comment: selected==="good"? "Positive feedback" : content,
          }),
        }
      );
      const data = await response.json();
      console.log(data);

      if (selected === "good") window.location.href = "https://google.com";
      else { setShowThanks(true); setEmail(""); setContent(""); setStars(1); setSelected(null); window.scrollTo({ top:0, behavior:"smooth" }); }
    } catch (error) { console.error(error); alert("API error"); }
  };

  const disableGood = !validateEmail(email);
  const disableBad = !validateEmail(email) || !content.trim();

  return (
    <div style={styles.fullScreen}>
      <div style={styles.container}>
        {/* CARD DỊCH VỤ */}
        <div style={{...styles.card, ...styles.serviceCard, backgroundImage: service.bgImg? `url(${service.bgImg})`:"none"}}>
          <div style={styles.logoWrapper}>
            {service.logo ? <img src={service.logo} alt="Logo" style={styles.logo} /> : <div style={styles.logoPlaceholder}>Logo</div>}
          </div>
          <h2 style={styles.serviceName}>{service.name}</h2>
        </div>

        {/* CARD FEEDBACK */}
        <div style={styles.card}>
          <h2 style={styles.title}>{service.feedbackTitle}</h2>
          <p style={styles.subtitle}>{service.feedbackSubtitle}</p>
          <div style={styles.row}>
            <button style={styles.badBtn(selected)} onClick={() => handleChoose("bad")}>{t.badBtn}</button>
            <button style={styles.goodBtn(selected)} onClick={() => handleChoose("good")}>{t.goodBtn}</button>
          </div>
        </div>

        {/* GOOD */}
        {selected==="good" && (
          <div ref={goodRef} style={styles.card}>
            <h3 style={{ color:"#16a34a" }}>{t.goodTitle}</h3>
            <input placeholder={t.emailPlaceholder} value={email} onChange={(e)=>handleEmailChange(e.target.value)} className={`input-field ${emailError?"input-error":""}`} />
            {emailError && <p style={styles.errorText}>{emailError}</p>}
            <button style={{...styles.primaryBtn, opacity:disableGood?0.6:1, pointerEvents:disableGood?"none":"auto"}} onClick={handleSubmit}>{t.nextBtn}</button>
          </div>
        )}

        {/* BAD */}
        {selected==="bad" && (
          <div ref={badRef} style={styles.card}>
            <h3 style={{ color:"#dc2626" }}>{t.badTitle}</h3>
            <div style={{ marginBottom:20 }}>
              {[1,2,3,4,5].map(n=>(
                <span key={n} onClick={()=>setStars(n)} style={{ fontSize:34, cursor:"pointer", color:n<=stars?"#facc15":"#e5e7eb"}}>★</span>
              ))}
            </div>
            <input placeholder={t.emailPlaceholder} value={email} onChange={(e)=>handleEmailChange(e.target.value)} className={`input-field ${emailError?"input-error":""}`} />
            {emailError && <p style={styles.errorText}>{emailError}</p>}
            <textarea placeholder={t.contentPlaceholder} value={content} onChange={(e)=>handleContentChange(e.target.value)} className={`input-field ${contentError?"input-error":""}`} style={{ height:100 }} />
            {contentError && <p style={styles.errorText}>{contentError}</p>}
            <button style={{...styles.primaryBtn, opacity:disableBad?0.6:1, pointerEvents:disableBad?"none":"auto"}} onClick={handleSubmit}>{t.sendBtn}</button>
          </div>
        )}

        {/* POPUP THANKS */}
        {showThanks && (
          <div style={styles.popupOverlay}>
            <div style={styles.popup}>
              <h3>{t.popupTitle}</h3>
              <p>{t.popupSubtitle}</p>
              <button style={styles.primaryBtn} onClick={()=>setShowThanks(false)}>Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================
// STYLE INLINE (giữ nguyên)
// ==========================
const styles = {
  fullScreen: { width:"100%", height:"100vh", display:"flex", justifyContent:"center", alignItems:"center", background:"#f3f4f6" },
  centerBox: { padding:20, background:"#fff", borderRadius:8, boxShadow:"0 4px 12px rgba(0,0,0,0.1)", textAlign:"center" },
  container: { maxWidth:600, width:"100%", padding:20 },
  card: { background:"#fff", borderRadius:8, padding:20, marginBottom:20, boxShadow:"0 2px 8px rgba(0,0,0,0.1)" },
  serviceCard: { backgroundSize:"cover", backgroundPosition:"center", color:"#fff", textAlign:"center" },
  logoWrapper: { display:"flex", justifyContent:"center", marginBottom:10 },
  logo: { width:60, height:60, objectFit:"cover", borderRadius:"50%" },
  logoPlaceholder: { width:60, height:60, borderRadius:"50%", background:"#ccc" },
  serviceName: { fontSize:24, fontWeight:600 },
  title: { fontSize:20, fontWeight:600, marginBottom:10 },
  subtitle: { fontSize:14, color:"#555", marginBottom:20 },
  row: { display:"flex", justifyContent:"space-around", marginBottom:10 },
  goodBtn: (selected)=>({ padding:"10px 20px", borderRadius:5, background:selected==="good"?"#16a34a":"#e5e7eb", color:selected==="good"?"#fff":"#000" }),
  badBtn: (selected)=>({ padding:"10px 20px", borderRadius:5, background:selected==="bad"?"#dc2626":"#e5e7eb", color:selected==="bad"?"#fff":"#000" }),
  inputField: { width:"100%", padding:10, borderRadius:5, border:"1px solid #ccc", marginBottom:10 },
  errorText: { color:"#dc2626", fontSize:12, marginBottom:10 },
  primaryBtn: { padding:"10px 20px", borderRadius:5, background:"#3b82f6", color:"#fff", border:"none", cursor:"pointer" },
  popupOverlay: { position:"fixed", top:0,left:0,right:0,bottom:0, background:"rgba(0,0,0,0.4)", display:"flex", justifyContent:"center", alignItems:"center" },
  popup: { background:"#fff", borderRadius:8, padding:20, width:300, textAlign:"center" },
};