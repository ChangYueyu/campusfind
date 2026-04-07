import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../db/db";

const fmt = (iso) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export default function DetailPage({ onEdit }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    (async () => {
      const p = await db.posts.get(id);
      setPost(p || null);
    })();
  }, [id]);

  if (!post) {
    return (
      <div className="page">
        <button className="btn" onClick={() => nav(-1)}>← Back</button>
        <p className="muted" style={{ marginTop: 12 }}>Post not found.</p>
      </div>
    );
  }

  const mainTime = post.eventAt ? post.eventAt : post.createdAt;

  return (
    <div className="page">
      <div className="detailTop">
        <button className="btn" onClick={() => nav(-1)}>← Back</button>
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={() => onEdit?.(post)}>Edit</button>
      </div>

      <div className="card">
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <span className="badge"><b>{post.type?.toUpperCase()}</b></span>
          <span className="badge">{post.category}</span>
          <span className="badge"><b>{post.status}</b></span>
        </div>

        <h2 style={{ margin: "6px 0 8px" }}>{post.title}</h2>

        {post.photoDataUrl && (
          <img className="detailImg" src={post.photoDataUrl} alt="item" />
        )}

        <p className="muted" style={{ marginTop: 10 }}>
          {post.type === "lost" ? "Lost time: " : "Found time: "}
          {mainTime ? fmt(mainTime) : "—"}
        </p>
        <p className="muted" style={{ marginTop: 2 }}>
          Posted: {post.createdAt ? fmt(post.createdAt) : "—"}
        </p>

        <p style={{ marginTop: 12 }}>{post.description}</p>

        {post.location && (
          <p className="muted" style={{ marginTop: 10 }}>
            📍 {post.location.lat.toFixed(5)}, {post.location.lng.toFixed(5)}
          </p>
        )}
      </div>
    </div>
  );
}