export interface SearchUsersRequest {
    page_no: number;
    search_tag: string;
    user_id: number
}

export interface UpdateBlockStatusRequest {
    block_user_id: number;
    is_block: number;
    user_id: number;
}
