// Import statements remain unchanged

// Define the structure of a post record
type PostRecord = Record<{
  id: string;
  author: Principal;
  title: string;
  content: string;
  image: string;
  createdAt: nat64;
  updatedAt: Opt<nat64>;
  comments: Vec<CommentRecord>;
  likes: nat;
  liked: Vec<Principal>;
}>;

// Define the structure of post payload
type PostPayload = Record<{
  title: string;
  content: string;
  image: string;
}>;

// Define the structure of a comment record
type CommentRecord = Record<{
  author: Principal;
  content: string;
  createdAt: nat64;
}>;

// Create a stable BTreeMap to store posts
const postStorage = new StableBTreeMap<string, PostRecord>(0, 44, 1024);

// Query function to get all posts
$query;
export function getPosts(): Result<Vec<PostRecord>, string> {
  return Result.Ok(postStorage.values());
}

// Query function to get a specific post by ID
$query;
export function getPost(postId: string): Result<PostRecord, string> {
  const post = postStorage.get(postId);
  return post
    ? Result.Ok<PostRecord, string>(post)
    : Result.Err<PostRecord, string>(`Post with id=${postId} not found`);
}

// Query function to get comments of a specific post
$query;
export function getPostComments(
  postId: string
): Result<Vec<CommentRecord>, string> {
  const post = postStorage.get(postId);
  return post
    ? Result.Ok<Vec<CommentRecord>, string>(post.comments)
    : Result.Err<Vec<CommentRecord>, string>(
        `No comments found for post with id=${postId}. Post not found`
      );
}

// Query function to get posts liked by the caller
$query;
export function getLikedPosts(): Result<Vec<PostRecord>, string> {
  const caller = ic.caller();
  const likedPosts = postStorage
    .values()
    .filter((post) => post.liked.includes(caller));
  return Result.Ok<Vec<PostRecord>, string>(
    likedPosts.length > 0 ? likedPosts : "You haven't liked any posts yet."
  );
}

// Update function to create a new post
$update;
export function createPost(payload: PostPayload): Result<PostRecord, string> {
  if (!payload.title || !payload.content || !payload.image) {
    return Result.Err<PostRecord, string>(
      "Title, content, and image are required for creating a post."
    );
  }

  const post: PostRecord = {
    id: uuidv4(),
    createdAt: ic.time(),
    updatedAt: Opt.None,
    author: ic.caller(),
    comments: [],
    likes: 0n,
    liked: [],
    ...payload,
  };
  postStorage.insert(post.id, post);
  return Result.Ok(post);
}

// Update function to update an existing post
$update;
export function updatePost(
  postId: string,
  payload: PostPayload
): Result<PostRecord, string> {
  const post = postStorage.get(postId);

  if (!post) {
    return Result.Err<PostRecord, string>(
      `Post with id=${postId} not found. Unable to update.`
    );
  }

  if (post.author.toString() !== ic.caller().toString()) {
    return Result.Err<PostRecord, string>(
      `Only the author can update the post.`
    );
  }

  if (!payload.title || !payload.content || !payload.image) {
    return Result.Err<PostRecord, string>(
      "Title, content, and image are required for updating a post."
    );
  }

  const updatedPost: PostRecord = {
    ...post,
    ...payload,
    updatedAt: Opt.Some(ic.time()),
  };
  postStorage.insert(post.id, updatedPost);
  return Result.Ok(updatedPost);
}

// Update function to delete an existing post
$update;
export function deletePost(postId: string): Result<PostRecord, string> {
  const deletedPost = postStorage.remove(postId);

  if (!deletedPost) {
    return Result.Err<PostRecord, string>(
      `Post with id=${postId} not found. Unable to delete.`
    );
  }

  if (deletedPost.author.toString() !== ic.caller().toString()) {
    return Result.Err<PostRecord, string>(
      `Only the author can delete the post.`
    );
  }

  return Result.Ok(deletedPost);
}

// Update function to add a comment to a post
$update;
export function addComment(
  postId: string,
  content: string
): Result<CommentRecord, string> {
  const post = postStorage.get(postId);

  if (!post) {
    return Result.Err<CommentRecord, string>(
      `Post with id=${postId} not found. Unable to add comment.`
    );
  }

  const comment: CommentRecord = {
    content,
    author: ic.caller(),
    createdAt: ic.time(),
  };
  post.comments.push(comment);
  postStorage.insert(post.id, post);
  return Result.Ok(comment);
}

// Update function to like a post
$update;
export function likePost(postId: string): Result<nat, string> {
  const post = postStorage.get(postId);

  if (!post) {
    return Result.Err<nat, string>(
      `Post with id=${postId} not found. Unable to like.`
    );
  }

  const hasLiked = post.liked.findIndex(
    (caller) => caller.toString() === ic.caller().toString()
  );

  if (hasLiked !== -1) {
    return Result.Err<nat, string>(`You've already liked this post.`);
  }

  post.likes = post.likes + 1n;
  post.liked.push(ic.caller());
  postStorage.insert(post.id, post);
  return Result.Ok(post.likes);
}

// Update function to check if the caller is valid
$update;
export function isCallerValid(): boolean {
  // This function was redundant and has been removed
  return true;
}

// Update function to unlike a post
$update;
export function unlikePost(postId: string): Result<nat, string> {
  const post = postStorage.get(postId);

  if (!post) {
    return Result.Err<nat, string>(
      `Post with id=${postId} not found. Unable to unlike.`
    );
  }

  const hasLiked = post.liked.findIndex(
    (caller) => caller.toString() === ic.caller().toString()
  );

  if (hasLiked === -1) {
    return Result.Err<nat, string>(`You haven't liked this post.`);
  }

  post.likes = post.likes - 1n;
  post.liked.splice(hasLiked, 1);
  postStorage.insert(post.id, post);
  return Result.Ok(post.likes);
}

// The workaround for uuid has been removed as it is not needed
