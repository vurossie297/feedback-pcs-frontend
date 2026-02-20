// storage.js
const FEEDBACKS_KEY = "feedbacks";
const REQUESTS_KEY = "upgradeRequests";
const STATUS_KEY = "serviceStatus";
const OWNERS_KEY = "owners";

// ------------------- Feedback -------------------
export const loadFeedbacks = () => {
  const data = localStorage.getItem(FEEDBACKS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveFeedbacks = (arr) => {
  localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(arr));
};

// ------------------- Upgrade Requests -------------------
export const loadRequests = () => {
  const data = localStorage.getItem(REQUESTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRequests = (arr) => {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(arr));
};

// ------------------- Service Status -------------------
export const loadStatus = () => {
  const data = localStorage.getItem(STATUS_KEY);
  if (data) return JSON.parse(data);

  // Nếu chưa có trong localStorage, trả về dữ liệu mặc định
  return [
    {
      ownerId: "owner1",
      name: "Khách sạn Sakura",
      logo: "https://example.com/logo_sakura.png",
      bgImg: "https://example.com/bg_sakura.jpg",
      serviceActive: true,
      feedbackTitle: "Đánh giá dịch vụ",
      feedbackSubtitle: "Bạn cảm thấy dịch vụ thế nào?"
    },
    {
      ownerId: "owner2",
      name: "Nhà hàng Fuji",
      logo: "https://example.com/logo_fuji.png",
      bgImg: "https://example.com/bg_fuji.jpg",
      serviceActive: true,
      feedbackTitle: "Đánh giá trải nghiệm",
      feedbackSubtitle: "Bạn có hài lòng với dịch vụ không?"
    },
  ];
};

export const saveStatus = (arr) => {
  localStorage.setItem(STATUS_KEY, JSON.stringify(arr));
};

// ------------------- Owners -------------------
export const loadOwners = () => {
  const data = localStorage.getItem(OWNERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveOwners = (arr) => {
  localStorage.setItem(OWNERS_KEY, JSON.stringify(arr));
};
