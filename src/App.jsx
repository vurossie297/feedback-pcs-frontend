import { BrowserRouter, Routes, Route } from "react-router-dom";
import FeedbackPage from "./FeedbackPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:slug" element={<FeedbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}