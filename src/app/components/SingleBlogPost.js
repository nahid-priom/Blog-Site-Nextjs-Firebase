// components/SingleBlogPost.js
const SingleBlogPost = ({ post }) => {
    // If post is not found (e.g., due to fallback: false), handle it here
    if (!post) {
      return <div>Loading...</div>;
    }
  
    return (
      <div>
        <h1>{post.title}</h1>
        <p>{post.contentData}</p>
        {/* Add other post details as needed */}
      </div>
    );
  };
  
  export default SingleBlogPost;
  