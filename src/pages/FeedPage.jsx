import PostList from "../components/PostList";

export default function FeedPage({ onEdit }) {
  return (
    <div className="page">
      <div className="pageHead">
        <h1 className="pageTitle">Feed</h1>
        <p className="pageSub">Browse lost & found posts near you.</p>
      </div>

      <PostList onEdit={onEdit} />
    </div>
  );
}