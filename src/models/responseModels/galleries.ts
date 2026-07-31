// Event Gallery response models (public web view).
// Mirrors the FastAPI gallery endpoints. On the public site only `visibility: "public"`
// galleries are returned (the backend uses optional auth → anonymous = public-only).

export type GalleryType = "cover" | "photo" | "video";
export type GalleryVisibility = "public" | "rsvp_only" | "private_link";

export interface GalleryMedia {
  id: number;
  media_url: string;
  sort_order: number;
  media_type: "image" | "video";
  thumb_url: string | null;
  duration_seconds: number | null;
}

export interface GalleryPost {
  id: number;
  caption: string | null;
  uploader_user_id: number | null;
  created_at: string;
  reviewed_at: string | null;
  is_hidden: number;
  uploader_role: string;
  approval_status: string;
  uploader_name: string;
  uploader_image: string;
  media: GalleryMedia[];
}

export interface Gallery {
  id: number;
  event_id: number;
  gallery_type: GalleryType;
  title: string;
  is_active: number;
  visibility: GalleryVisibility;
  share_token: string | null;
  cover_media_id: number | null;
  event_name?: string;
  is_photographer?: number;
  cover_image: string | null;
  photo_count: number;
}

export interface PublicEventGalleriesResponse {
  success: boolean;
  is_owner?: boolean;
  galleries: Gallery[];
}

export interface PublicGalleryResponse {
  success: boolean;
  is_owner?: boolean;
  viewer_role?: string;
  can_upload?: boolean;
  tab?: string;
  gallery: Gallery & { owner_id?: number };
  posts: GalleryPost[];
  page_no: number;
  total_posts: number;
  total_pages: number;
  has_more: boolean;
}
