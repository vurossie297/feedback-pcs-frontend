import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./FeedbackPage.css";

const translations = {
  vi: {
    goodBtn: "👍 Có",
    badBtn: "👎 Không",
    emailPlaceholder: "Email của bạn",
    contentPlaceholder: "Chia sẻ trải nghiệm...",
    nextBtn: "Tiếp theo",
    sendBtn: "Gửi cảm nhận",
    emailError: "Email không hợp lệ",
    contentError: "Vui lòng nhập nội dung góp ý",
    popupTitle: "Cảm ơn bạn đã góp ý!",
    popupSubtitle: "Chúng tôi sẽ cải thiện dịch vụ tốt hơn.",
    badTitle: "Chúng tôi muốn cải thiện tốt hơn",
    goodTitle: "🎉 Tuyệt vời!",
  },
  en: {
    goodBtn: "👍 Yes",
    badBtn: "👎 No",
    emailPlaceholder: "Your email",
    contentPlaceholder: "Share your experience...",
    nextBtn: "Next",
    sendBtn: "Send Feedback",
    emailError: "Invalid email",
    contentError: "Please enter feedback",
    popupTitle: "Thanks for your feedback!",
    popupSubtitle: "We will improve our service.",
    badTitle: "We want to improve",
    goodTitle: "🎉 Great!",
  },
  ja: {
    goodBtn: "👍 はい",
    badBtn: "👎 いいえ",
    emailPlaceholder: "メール",
    contentPlaceholder: "体験を共有してください...",
    nextBtn: "次へ",
    sendBtn: "感想を送る",
    emailError: "有効なメールアドレスを入力してください",
    contentError: "フィードバックを入力してください",
    popupTitle: "ご意見ありがとうございます！",
    popupSubtitle: "サービスを改善いたします。",
    badTitle: "改善したい点があります",
    goodTitle: "🎉 素晴らしい!",
  },
  zh: {
    goodBtn: "👍 是",
    badBtn: "👎 否",
    emailPlaceholder: "你的邮箱",
    contentPlaceholder: "分享你的体验...",
    nextBtn: "下一步",
    sendBtn: "发送反馈",
    emailError: "无效的邮箱",
    contentError: "请输入反馈",
    popupTitle: "感谢您的反馈！",
    popupSubtitle: "我们将改进服务。",
    badTitle: "我们希望改进",
    goodTitle: "🎉 太棒了！",
  },
  ko: {
    goodBtn: "👍 예",
    badBtn: "👎 아니요",
    emailPlaceholder: "이메일",
    contentPlaceholder: "경험을 공유하세요...",
    nextBtn: "다음",
    sendBtn: "피드백 보내기",
    emailError: "유효한 이메일을 입력하세요",
    contentError: "피드백을 입력해주세요",
    popupTitle: "피드백 감사합니다!",
    popupSubtitle: "서비스를 개선하겠습니다.",
    badTitle: "개선하고 싶습니다",
    goodTitle: "🎉 훌륭합니다!",
  },
};

export default function FeedbackPage() {
  const { ownerId } = useParams(); // slug
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");
  const [selected, setSelected] = useState(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [stars, setStars] = useState(1);
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState("");
  const [showThanks, setShowThanks] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    // quét ngôn ngữ trình duyệt
    const userLang = navigator.language || navigator.userLanguage;
    if (userLang.startsWith("vi")) setLang("vi");
    else if (userLang.startsWith("ja")) setLang("ja");
    else if (userLang.startsWith("zh")) setLang("zh");
    else if (userLang.startsWith("ko")) setLang("ko");
    else setLang("en");

    // load business
    fetch(`https://feedback-pcs-api.vurossie297.workers.dev/business/${ownerId}`)
      .then((res) => res.json())
      .then((data) => {
        setBusiness(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setBusiness(null);
        setLoading(false);
      });
  }, [ownerId]);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value);
  const handleEmailChange = (value) => {
    setEmail(value);
    setEmailError(validateEmail(value) ? "" : t.emailError);
  };
  const handleContentChange = (value) => {
    setContent(value);
    setContentError(value.trim() ? "" : t.contentError);
  };

  const handleChoose = (type) => {
    setSelected(type);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setEmailError(t.emailError);
      return;
    }
    if (selected === "bad" && !content.trim()) {
      setContentError(t.contentError);
      return;
    }

    try {
      const response = await fetch(
        "https://feedback-pcs-api.vurossie297.workers.dev/api/feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: ownerId,
            rating: selected === "bad" ? stars : 5,
            comment: selected === "good" ? "Positive feedback" : content,
          }),
        }
      );
      const data = await response.json();
      console.log(data);

      if (selected === "good") window.location.href = "https://google.com";
      else {
        setShowThanks(true);
        setEmail("");
        setContent("");
        setStars(1);
        setSelected(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
      alert("API error");
    }
  };

  const disableGood = !validateEmail(email);
  const disableBad = !validateEmail(email) || !content.trim();

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  if (!business || business.error) return <div style={{ padding: 40, textAlign: "center" }}>🚫 Business not found</div>;

  return (
    <div style={styles.fullScreen}>
      <div style={styles.container}>
        {/* CARD BUSINESS */}
        <div
          style={{
            ...styles.card,
            ...styles.serviceCard,
            backgroundImage: business.bgImg ? `url(${business.bgImg})` : "none",
          }}
        >
          <div style={styles.logoWrapper}>
            {business.logo ? <img src={business.logo} alt="Logo" style={styles.logo} /> : <div style={styles.logoPlaceholder}>Logo</div>}
          </div>
          <h2 style={styles.serviceName}>{business.name}</h2>
        </div>

        {/* CARD FEEDBACK */}
        <div style={styles.card}>
          <h2 style={styles.title}>{business.feedbackTitle || "Đánh giá dịch vụ"}</h2>
          <p style={styles.subtitle}>{business.feedbackSubtitle || "Bạn cảm thấy dịch vụ thế nào?"}</p>

          <div style={styles.row}>
            <button style={styles.badBtn(selected)} onClick={() => handleChoose("bad")}>{t.badBtn}</button>
            <button style={styles.goodBtn(selected)} onClick={() => handleChoose("good")}>{t.goodBtn}</button>
          </div>
        </div>

        {/* GOOD */}
        {selected === "good" && (
          <div style={styles.card}>
            <h3 style={{ color: "#16a34a" }}>{t.goodTitle}</h3>
            <input
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`input-field ${emailError ? "input-error" : ""}`}
            />
            {emailError && <p style={styles.errorText}>{emailError}</p>}
            <button
              style={{ ...styles.primaryBtn, opacity: disableGood ? 0.6 : 1, pointerEvents: disableGood ? "none" : "auto" }}
              onClick={handleSubmit}
            >
              {t.nextBtn}
            </button>
          </div>
        )}

        {/* BAD */}
        {selected === "bad" && (
          <div style={styles.card}>
            <h3 style={{ color: "#dc2626" }}>{t.badTitle}</h3>

            <div style={{ marginBottom: 20 }}>
              {[1,2,3,4,5].map(n => (
                <span
                  key={n}
                  onClick={() => setStars(n)}
                  style={{ fontSize: 34, cursor: "pointer", color: n <= stars ? "#facc15" : "#e5e7eb" }}
                >★</span>
              ))}
            </div>

            <input
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`input-field ${emailError ? "input-error" : ""}`}
            />
            {emailError && <p style={styles.errorText}>{emailError}</p>}

            <textarea
              placeholder={t.contentPlaceholder}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className={`input-field ${contentError ? "input-error" : ""}`}
              style={{ height: 100 }}
            />
            {contentError && <p style={styles.errorText}>{contentError}</p>}

            <button
              style={{ ...styles.primaryBtn, opacity: disableBad ? 0.6 : 1, pointerEvents: disableBad ? "none" : "auto" }}
              onClick={handleSubmit}
            >
              {t.sendBtn}
            </button>
          </div>
        )}

        {/* POPUP THANKS */}
        {showThanks && (
          <div style={styles.popupOverlay}>
            <div style={styles.popup}>
              <h3>{t.popupTitle}</h3>
              <p>{t.popupSubtitle}</p>
              <button style={styles.primaryBtn} onClick={() => setShowThanks(false)}>Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  fullScreen: { minHeight: "100vh", background: "#f3f4f6", padding: "30px 16px" },
  container: { maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 },
  card: { background: "white", borderRadius: 20, padding: 28, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" },
  title: { textAlign: "center", marginBottom: 12, fontSize: 20 },
  subtitle: { textAlign: "center", marginBottom: 24, color: "#6b7280", fontSize: 15 },
  row: { display: "flex", gap: 16 },
  goodBtn: (selected) => ({
    flex:1, padding:16, borderRadius:999, fontWeight:600, cursor:"pointer",
    border:"2px solid #16a34a", background:selected==="good"?"#dcfce7":"#fff", color:"#16a34a"
  }),
  badBtn: (selected) => ({
    flex:1, padding:16, borderRadius:999, fontWeight:600, cursor:"pointer",
    border:"2px solid #dc2626", background:selected==="bad"?"#fee2e2":"#fff", color:"#dc2626"
  }),
  primaryBtn: { width:"100%", padding:16, borderRadius:14, border:"none", background:"#5392f9", color:"white", fontWeight:600, cursor:"pointer" },
  errorText: { color:"#dc2626", fontSize:14, marginBottom:10 },
  centerBox: { maxWidth:480, margin:"0 auto", background:"white", padding:30, borderRadius:20, textAlign:"center" },
  serviceCard: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:300, backgroundColor:"#e5e7eb", backgroundSize:"cover", backgroundPosition:"center", borderRadius:20, position:"relative", overflow:"hidden" },
  logoWrapper: { width:80, height:80, borderRadius:"50%", overflow:"hidden", marginBottom:12, border:"2px solid white", display:"flex", justifyContent:"center", alignItems:"center", backgroundColor:"#fff" },
  logo: { width:"100%", height:"100%", objectFit:"cover" },
  logoPlaceholder: { fontSize:12, color:"#6b7280" },
  serviceName: { color:"white", fontSize:20, fontWeight:600, textAlign:"center", textShadow:"0 1px 3px rgba(0,0,0,0.7)" },
  popupOverlay: { position:"fixed", top:0, left:0, width:"100%", height:"100%", backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:9999 },
  popup: { background:"#fff", borderRadius:20, padding:30, maxWidth:360, textAlign:"center", boxShadow:"0 8px 24px rgba(0,0,0,0.2)" },
};