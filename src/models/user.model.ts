export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

export interface User {
	id: string;
	fullName: string;
	email: string;
	phone?: string;
	role: UserRole;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateUserPayload {
	fullName: string;
	email: string;
	phone?: string;
	role: UserRole;
	isActive?: boolean;
}

export interface UpdateUserPayload {
	fullName?: string;
	email?: string;
	phone?: string;
	role?: UserRole;
	isActive?: boolean;
}

export interface ListUsersQuery {
	page?: number;
	limit?: number;
	search?: string;
}

export interface PaginatedUsers {
	items: User[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}
