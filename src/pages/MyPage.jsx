import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../db/db";

function getOwnerId() {
  const key = "campusfind_ownerId";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

const fmt = (iso) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export default function MyPage({ onEdit }) {
  const nav = useNavigate();
  const ownerId = useMemo(() => getOwnerId(), []);
  const [myPosts, setMyPosts] = useState([]);

  async function load() {
    const all = await db.posts.orderBy("createdAt").reverse().toArray();
    const mine = all.filter((p) => p.ownerId === ownerId);
    setMyPosts(mine);
  }

  useEffect(() => {
    load();
  }, []);

  async function markReturned(id) {
    await db.posts.update(id, { status: "Returned", updatedAt: new Date().toISOString() });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this post permanently? This cannot be undone.")) return;
    await db.posts.delete(id);
    load();
  }

  return (
    <div className="page">
      <div className="pageHead">
        <h1 className="pageTitle">My Posts</h1>
        <p className="pageSub">Posts created on this device.</p>
      </div>

    <div className="btnRow" style={{ marginBottom: 12 }}>
  <button className="btn" onClick={load}>Refresh</button>
</div>

      {myPosts.length === 0 ? (
        <div className="card">
          <p className="muted">
            You haven’t created any posts yet. Go to the <b>Create</b> tab to add one 
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {myPosts.map((p) => {
            const mainTime = p.eventAt ? p.eventAt : p.createdAt;

            return (
              <div
                key={p.id}
                className="post"
                onClick={() => nav(`/post/${p.id}`)}
                style={{ cursor: "pointer" }}
              >
                {p.photoDataUrl ? (
                  <img className="postImg" src={p.photoDataUrl} alt="item" />
                ) : (
                  <div className="postImg" style={{ display: "grid", placeItems: "center", color: "rgba(111,101,90,0.65)" }}>
                    No photo
                  </div>
                )}

                <div className="postBody">
                  <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                    <span className="badge"><b>{p.type?.toUpperCase()}</b></span>
                    <span className="badge">{p.category}</span>
                    <span className="badge"><b>{p.status}</b></span>
                  </div>

                  <h3 className="postTitle">{p.title}</h3>

                  <p className="muted" style={{ marginTop: 4 }}>
                    {p.type === "lost" ? "Lost time: " : "Found time: "}
                    {mainTime ? fmt(mainTime) : "—"}
                  </p>

                  <p className="postDesc" style={{ marginTop: 6 }}>{p.description}</p>

                  <div
                    className="btnRow"
                    style={{ marginTop: 10 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="btn" onClick={() => onEdit?.(p)}>Edit</button>

                    <button
                      className="btn"
                      onClick={() => markReturned(p.id)}
                      disabled={p.status === "Returned"}
                    >
                      Mark Returned
                    </button>

                    <button className="btn btnDanger" onClick={() => remove(p.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}