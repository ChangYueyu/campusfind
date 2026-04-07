import { useState } from "react";
import "./App.css";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import FeedPage from "./pages/FeedPage";
import CreatePage from "./pages/CreatePage";
import MyPage from "./pages/MyPage";
import DetailPage from "./pages/DetailPage";

function TabBar() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const go = (path) => nav(path);

  return (
    <div className="tabbar">
      <button className={`tabbtn ${pathname.startsWith("/feed") ? "active" : ""}`} onClick={() => go("/feed")}>
         Feed
      </button>
      <button className={`tabbtn ${pathname.startsWith("/create") ? "active" : ""}`} onClick={() => go("/create")}>
         Create
      </button>
      <button className={`tabbtn ${pathname.startsWith("/my") ? "active" : ""}`} onClick={() => go("/my")}>
         My
      </button>
    </div>
  );
}

export default function App() {
  const [editingPost, setEditingPost] = useState(null);

  return (
    <div className="appShell">
      <div className="appContent">
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />

          <Route
            path="/feed"
            element={
              <FeedPage
                onEdit={(post) => {
                  setEditingPost(post);
                }}
              />
            }
          />

          <Route
            path="/create"
            element={
              <CreatePage
                editingPost={editingPost}
                onCancelEdit={() => setEditingPost(null)}
                onSaved={() => setEditingPost(null)}
              />
            }
          />

          <Route path="/my" element={<MyPage />} />

          <Route
            path="/post/:id"
            element={
              <DetailPage
                onEdit={(post) => {
                  setEditingPost(post);
                  
                }}
              />
            }
          />
        </Routes>
      </div>

      <TabBar />
    </div>
  );
}