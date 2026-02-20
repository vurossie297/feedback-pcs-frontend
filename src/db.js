import { loadFeedbacks } from "./storage.js";  // chú ý: số nhiều 'Feedbacks'

// Dữ liệu mẫu
const defaultFeedbacks = [
  { ownerId: "owner1", user: "user1", type: "bad", stars: 2, email: "abc@gmail.com", content: "Phòng ồn", date: "2026-02-14", time: "14:32" },
  { ownerId: "owner1", user: "user2", type: "good", stars: null, email: "user@gmail.com", content: "Đã đánh giá tại Google", date: "2026-02-13", time: "09:15" },
  { ownerId: "owner2", user: "user3", type: "bad", stars: 1, email: "abc@gmail.com", content: "Phòng ồn", date: "2026-02-14", time: "14:32" },
  { ownerId: "owner2", user: "user4", type: "good", stars: null, email: "user@gmail.com", content: "Đã đánh giá tại Google", date: "2026-02-13", time: "09:15" },
  { ownerId: "test", user: "user5", type: "bad", stars: 3, email: "abcdef@gmail.com", content: "Phòng ồn quá, nhân viên thái độ không tốt, ban đêm mãi không ngủ được, mọi người trước khi thuê nên xem lại nhé.rất phí tiền cho 1 đêm", date: "2026-02-24", time: "14:32" },
  { ownerId: "test", user: "user6", type: "good", stars: null, email: "userxxxx@gmail.com", content: "Đã đánh giá tại Google", date: "2026-02-03", time: "09:15" },
];

// Chỉ export **1 feedbacks**, ưu tiên load từ storage nếu có
export const feedbacks = loadFeedbacks() || defaultFeedbacks;

export const owners = [
  { id: "owner1", password: "1234" },
  { id: "owner2", password: "1234" },
];

export const serviceStatus = [
  { ownerId: "owner1", serviceActive: false, packageActive: false },
  { ownerId: "owner2", serviceActive: false, packageActive: false },
];

export const upgradeRequests = [
  // sẽ push khi owner gửi
];
