import { useState } from "react";
import { db } from "../db/db";

const CATEGORIES = ["keys", "wallet", "card", "electronics", "clothing", "other"];

function getOwnerId() {
  const key = "campusfind_ownerId";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function nowForDatetimeLocal() {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16); 
}

export default function PostForm({ onCreated, onSaved }) {
  const [type, setType] = useState("lost");
  const [category, setCategory] = useState("keys");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [eventAt, setEventAt] = useState(nowForDatetimeLocal());

  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [location, setLocation] = useState(null);
  const [locMsg, setLocMsg] = useState("");

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result);
    reader.readAsDataURL(file);
  }

  function getLocation() {
    setLocMsg("Requesting location...");
    if (!navigator.geolocation) {
      setLocMsg("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLocMsg("Location captured.");
      },
      (err) => setLocMsg(`Location error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function createPost(e) {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter a title.");

    const nowIso = new Date().toISOString();
    const eventIso = eventAt ? new Date(eventAt).toISOString() : nowIso;

    const newPost = {
      id: crypto.randomUUID(),
      ownerId: getOwnerId(),
      type,
      category,
      title: title.trim(),
      description: description.trim(),
      photoDataUrl: photoDataUrl || null,
      location: location || null,
      status: "Open",
      eventAt: eventIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await db.posts.add(newPost);

   
    (onSaved || onCreated)?.(newPost);

    
    setType("lost");
    setCategory("keys");
    setTitle("");
    setDescription("");
    setEventAt(nowForDatetimeLocal());
    setPhotoDataUrl("");
    setLocation(null);
    setLocMsg("");

    alert("Post created.");
  }

  return (
    <form onSubmit={createPost}>
      <div className="row">
        <div className="field">
          <div className="label">Type</div>
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>

        <div className="field">
          <div className="label">Category</div>
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <div className="label">Title</div>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Lost student card"
        />
      </div>

      <div className="field">
        <div className="label">Description</div>
        <textarea
          className="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Colour, brand, where/when..."
        />
      </div>

      <div className="field">
        <div className="label">{type === "lost" ? "Lost time" : "Found time"}</div>
        <input className="input" type="datetime-local" value={eventAt} onChange={(e) => setEventAt(e.target.value)} />
        <div className="muted">Default is now; you can adjust if needed.</div>
      </div>

      <div className="field">
        <div className="label">Photo (Camera/File)</div>
        <input className="input" type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />
        {photoDataUrl && (
          <div style={{ marginTop: 10 }}>
            <img className="preview" src={photoDataUrl} alt="preview" />
          </div>
        )}
      </div>

      <div className="btnRow">
        <button type="button" className="btn" onClick={getLocation}>
          Use my location
        </button>
        <span className="muted">{locMsg}</span>
        {location && (
          <span className="badge">
            Location: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </span>
        )}
      </div>

      <div className="btnRow" style={{ marginTop: 12 }}>
        <button type="submit" className="btn btnPrimary">
          Create
        </button>
      </div>
    </form>
  );
}