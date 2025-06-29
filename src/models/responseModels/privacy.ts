export interface SearchedUser {
    user_id: number;
    name: string;
    image: string;
    distance: number;
}

export interface SearchUsersResponse {
    success: boolean;
    search_tag: string;
    current_page_no: string;
    total_pages: number;
    SearchedUsers: SearchedUser[];
}

export interface BlockedUsersResponse {
    success: boolean;
    block_users_list: {
        block_user_id: number;
        name: string;
        image: string;
        distance: number;
    }[];
}

export interface UpdateBlockStatusResponse {
    success: boolean;
    message: string;
}
