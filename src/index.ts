// canister code goes here
import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Vec,
  match,
  Result,
  nat64,
  ic,
  Opt,
  Principal,
  nat,
} from "azle";
import { v4 as uuidv4 } from "uuid";

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
  return match(postStorage.get(postId), {
    Some: (post) => Result.Ok<PostRecord, string>(post),
    None: () =>
      Result.Err<PostRecord, string>(`Post with id=${postId} not found`),
  });
}

// Query function to get comments of a specific post
$query;
export function getPostComments(
  postId: string
): Result<Vec<CommentRecord>, string> {
  return match(postStorage.get(postId), {
    Some: (post) => Result.Ok<Vec<CommentRecord>, string>(post.comments),
    None: () =>
      Result.Err<Vec<CommentRecord>, string>(
        `No comments found for post with id=${postId}. Post not found`
      ),
  });
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
  return match(postStorage.get(postId), {
    Some: (post) => {
      if (post.author.toString() !== ic.caller().toString()) {
        return Result.Err<PostRecord, string>(
          `Only the author can update the post.`
        );
      }
      const updatedPost: PostRecord = {
        ...post,
        ...payload,
        updatedAt: Opt.Some(ic.time()),
      };
      postStorage.insert(post.id, updatedPost);
      return Result.Ok<PostRecord, string>(updatedPost);
    },
    None: () =>
      Result.Err<PostRecord, string>(
        `Post with id=${postId} not found. Unable to update.`
      ),
  });
}

// Update function to delete an existing post
$update;
export function deletePost(postId: string): Result<PostRecord, string> {
  return match(postStorage.remove(postId), {
    Some: (deletedPost) => {
      if (deletedPost.author.toString() !== ic.caller().toString()) {
        return Result.Err<PostRecord, string>(
          `Only the author can delete the post.`
        );
      }
      return Result.Ok<PostRecord, string>(deletedPost);
    },
    None: () =>
      Result.Err<PostRecord, string>(
        `Post with id=${postId} not found. Unable to delete.`
      ),
  });
}

// Update function to add a comment to a post
$update;
export function addComment(
  postId: string,
  content: string
): Result<CommentRecord, string> {
  return match(postStorage.get(postId), {
    Some: (post) => {
      const comment: CommentRecord = {
        content,
        author: ic.caller(),
        createdAt: ic.time(),
      };
      post.comments.push(comment);
      postStorage.insert(post.id, post);
      return Result.Ok<CommentRecord, string>(comment);
    },
    None: () =>
      Result.Err<CommentRecord, string>(
        `Post with id=${postId} not found. Unable to add comment.`
      ),
  });
}

// Update function to like a post
$update;
export function likePost(postId: string): Result<nat, string> {
  return match(postStorage.get(postId), {
    Some: (post) => {
      const hasLiked = post.liked.findIndex(
        (caller) => caller.toString() === ic.caller().toString()
      );
      if (hasLiked !== -1) {
        return Result.Err<nat, string>(`You've already liked this post.`);
      }
      post.likes = post.likes + 1n;
      post.liked.push(ic.caller());
      postStorage.insert(post.id, post);
      return Result.Ok<nat, string>(post.likes);
    },
    None: () =>
      Result.Err<nat, string>(
        `Post with id=${postId} not found. Unable to like.`
      ),
  });
}

// Update function to check if the caller is valid
$update;
export function isCallerValid(): boolean {
  return ic.caller().toString() === ic.caller().toString();
}

// Update function to unlike a post
$update;
export function unlikePost(postId: string): Result<nat, string> {
  return match(postStorage.get(postId), {
    Some: (post) => {
      const hasLiked = post.liked.findIndex(
        (caller) => caller.toString() === ic.caller().toString()
      );
      if (hasLiked === -1) {
        return Result.Err<nat, string>(`You haven't liked this post.`);
      }
      post.likes = post.likes - 1n;
      post.liked.splice(hasLiked, 1);
      postStorage.insert(post.id, post);
      return Result.Ok<nat, string>(post.likes);
    },
    None: () =>
      Result.Err<nat, string>(
        `Post with id=${postId} not found. Unable to unlike.`
      ),
  });
}

// A workaround to make the uuid package work with Azle
globalThis.crypto = {
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};
