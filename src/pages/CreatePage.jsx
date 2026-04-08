import { useNavigate } from "react-router-dom";
import PostForm from "../components/PostForm";

export default function CreatePage({ editingPost, onCancelEdit, onSaved }) {
  const nav = useNavigate();

  function handleSaved(post) {
   
    onSaved?.(post);
   
    nav("/feed");
  }

  return (
    <div className="page">
      <div className="pageHead">
        <h1 className="pageTitle">{editingPost ? "Edit" : "Create"}</h1>
        <p className="pageSub">Report a lost or found item.</p>
      </div>

      <div className="card">
        <PostForm
          editingPost={editingPost}
          onCancelEdit={onCancelEdit}
          onSaved={handleSaved}
        />
      </div>
    </div>
  );
}