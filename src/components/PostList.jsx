import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../db/db";

const CATEGORIES = ["keys", "wallet", "card", "electronics", "clothing", "other"];


const fmt = (iso) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));


function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


export default function PostList({ refreshKey, onEdit }) {
  const nav = useNavigate();

  const [posts, setPosts] = useState([]);

  
  const [typeFilter, setTypeFilter] = useState("all"); 
  const [catFilter, setCatFilter] = useState("all");
  const [keyword, setKeyword] = useState("");

 
  const [me, setMe] = useState(null);
  const [meMsg, setMeMsg] = useState("");
  const [sortByDistance, setSortByDistance] = useState(true); 

  async function load() {
    const all = await db.posts.orderBy("createdAt").reverse().toArray();
    setPosts(all);
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  async function markReturned(id) {
    await db.posts.update(id, {
      status: "Returned",
      updatedAt: new Date().toISOString(),
    });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this post?")) return;
    await db.posts.delete(id);
    load();
  }

  function getMyLocationForDistance() {
    setMeMsg("Getting your location...");
    if (!navigator.geolocation) {
      setMeMsg("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMe({ lat: latitude, lng: longitude });
        setMeMsg("Location set YES!");
      },
      (err) => setMeMsg(`Location error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  
  const filtered = posts.filter((p) => {
    const okType = typeFilter === "all" || p.type === typeFilter;
    const okCat = catFilter === "all" || p.category === catFilter;
    const kw = keyword.trim().toLowerCase();
    const hay = `${p.title ?? ""} ${p.description ?? ""}`.toLowerCase();
    const okKw = !kw || hay.includes(kw);
    return okType && okCat && okKw;
  });

  
  const filteredSorted = [...filtered].sort((a, b) => {
    if (!sortByDistance) return 0;
    if (!me) return 0;
    if (!a.location || !b.location) return 0;

    const da = distanceKm(me.lat, me.lng, a.location.lat, a.location.lng);
    const dbb = distanceKm(me.lat, me.lng, b.location.lat, b.location.lng);
    return da - dbb;
  });

  return (
    <div style={{ marginTop: 16 }}>
   
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <label>
          Type:
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ marginLeft: 6 }}>
            <option value="all">All</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </label>

        <label>
          Category:
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={{ marginLeft: 6 }}>
            <option value="all">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Keyword:
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g., card / airpods"
            style={{ marginLeft: 6 }}
          />
        </label>
      </div>

  
      <div className="btnRow" style={{ marginBottom: 12 }}>
        <button type="button" className="btn" onClick={getMyLocationForDistance}>
          Use my location (for distance)
        </button>
        <span className="muted">{meMsg}</span>
        {me && (
          <span className="badge">
            Location: {me.lat.toFixed(4)}, {me.lng.toFixed(4)}
          </span>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <input
            type="checkbox"
            checked={sortByDistance}
            onChange={(e) => setSortByDistance(e.target.checked)}
          />
          <span className="muted">Sort by distance</span>
        </label>
      </div>

      <p style={{ fontSize: 12, opacity: 0.75 }}>
        Showing {filteredSorted.length} of {posts.length}
      </p>

      {filteredSorted.length === 0 && <p>No matching posts.</p>}

      {filteredSorted.map((p) => {
        const mainTime = p.eventAt ? p.eventAt : p.createdAt;

        const dist =
          me && p.location
            ? distanceKm(me.lat, me.lng, p.location.lat, p.location.lng)
            : null;

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
              <div
                className="postImg"
                style={{ display: "grid", placeItems: "center", color: "rgba(111,101,90,0.65)" }}
              >
                No photo
              </div>
            )}

            <div className="postBody">
              <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                <span className="badge"><b>{p.type.toUpperCase()}</b></span>
                <span className="badge">{p.category}</span>
                <span className="badge"><b>{p.status}</b></span>
                {dist !== null && <span className="badge"> {dist.toFixed(2)} km</span>}
              </div>

              <h3 className="postTitle">{p.title}</h3>

              <p className="muted" style={{ marginTop: 6 }}>
                {p.type === "lost" ? "Lost time: " : "Found time: "}
                {mainTime ? fmt(mainTime) : "—"}
              </p>

              <p className="muted" style={{ marginTop: 2 }}>
                Posted: {p.createdAt ? fmt(p.createdAt) : "—"}
              </p>

              <p className="postDesc" style={{ marginTop: 8 }}>{p.description}</p>

              {p.location && (
                <p className="muted" style={{ marginTop: 8 }}>
                  Location: {p.location.lat.toFixed(5)}, {p.location.lng.toFixed(5)}
                </p>
              )}

           
              <div
                className="btnRow"
                style={{ marginTop: 10 }}
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <button
                    className="btn"
                    onClick={() => onEdit(p)}
                  >
                    Edit
                  </button>
                )}

                <button
                  className="btn"
                  onClick={() => markReturned(p.id)}
                  disabled={p.status === "Returned"}
                >
                  Mark Returned
                </button>

                <button
                  className="btn btnDanger"
                  onClick={() => remove(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}