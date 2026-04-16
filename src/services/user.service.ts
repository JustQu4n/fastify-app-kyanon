import { randomUUID } from 'node:crypto';

import {
	CreateUserPayload,
	ListUsersQuery,
	PaginatedUsers,
	UpdateUserPayload,
	User,
} from '../models/user.model';

export class ServiceError extends Error {
	public readonly statusCode: number;

	public readonly code: string;

	constructor(statusCode: number, code: string, message: string) {
		super(message);
		this.name = 'ServiceError';
		this.statusCode = statusCode;
		this.code = code;
	}
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

class UserService {
	private users: User[] = [];

	list(query: ListUsersQuery = {}): PaginatedUsers {
		const page = this.normalizePage(query.page);
		const limit = this.normalizeLimit(query.limit);
		const search = this.normalizeSearch(query.search);

		const filteredUsers = this.users.filter((user) => this.matchesSearch(user, search));
		const total = filteredUsers.length;
		const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
		const start = (page - 1) * limit;
		const items = filteredUsers.slice(start, start + limit);

		return {
			items,
			page,
			limit,
			total,
			totalPages,
		};
	}

	getById(id: string): User {
		const user = this.users.find((entry) => entry.id === id);

		if (!user) {
			throw new ServiceError(404, 'USER_NOT_FOUND', 'User not found');
		}

		return user;
	}

	create(payload: CreateUserPayload): User {
		const email = this.normalizeEmail(payload.email);

		if (this.findByEmail(email)) {
			throw new ServiceError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists');
		}

		const now = new Date().toISOString();
		const user: User = {
			id: randomUUID(),
			fullName: this.normalizeText(payload.fullName),
			email,
			role: payload.role,
			isActive: payload.isActive ?? true,
			createdAt: now,
			updatedAt: now,
		};

		const phone = this.normalizeOptionalText(payload.phone);

		if (phone) {
			user.phone = phone;
		}

		this.users.push(user);

		return user;
	}

	update(id: string, payload: UpdateUserPayload): User {
		const index = this.users.findIndex((entry) => entry.id === id);

		if (index === -1) {
			throw new ServiceError(404, 'USER_NOT_FOUND', 'User not found');
		}

		const currentUser = this.users[index];

		if (!currentUser) {
			throw new ServiceError(404, 'USER_NOT_FOUND', 'User not found');
		}

		const nextEmail = payload.email ? this.normalizeEmail(payload.email) : currentUser.email;

		const duplicateEmail = this.users.find(
			(entry) => entry.email === nextEmail && entry.id !== currentUser.id,
		);

		if (duplicateEmail) {
			throw new ServiceError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists');
		}

		const updatedUser: User = {
			id: currentUser.id,
			fullName: payload.fullName ? this.normalizeText(payload.fullName) : currentUser.fullName,
			email: nextEmail,
			role: payload.role ?? currentUser.role,
			isActive: payload.isActive ?? currentUser.isActive,
			createdAt: currentUser.createdAt,
			updatedAt: new Date().toISOString(),
		};

		if (payload.phone === undefined) {
			if (currentUser.phone) {
				updatedUser.phone = currentUser.phone;
			}
		} else {
			const phone = this.normalizeOptionalText(payload.phone);

			if (phone) {
				updatedUser.phone = phone;
			}
		}

		this.users[index] = updatedUser;

		return updatedUser;
	}

	delete(id: string): void {
		const index = this.users.findIndex((entry) => entry.id === id);

		if (index === -1) {
			throw new ServiceError(404, 'USER_NOT_FOUND', 'User not found');
		}

		this.users.splice(index, 1);
	}

	private findByEmail(email: string): User | undefined {
		return this.users.find((entry) => entry.email === email);
	}

	private matchesSearch(user: User, search: string): boolean {
		if (!search) {
			return true;
		}

		const normalizedSearch = search.toLowerCase();

		return (
			user.fullName.toLowerCase().includes(normalizedSearch) ||
			user.email.toLowerCase().includes(normalizedSearch) ||
			user.role.toLowerCase().includes(normalizedSearch)
		);
	}

	private normalizeText(value: string): string {
		const normalized = value.trim();

		if (!normalized) {
			throw new ServiceError(400, 'INVALID_VALUE', 'Value must not be empty');
		}

		return normalized;
	}

	private normalizeOptionalText(value?: string): string | undefined {
		if (value === undefined) {
			return undefined;
		}

		const normalized = value.trim();

		return normalized || undefined;
	}

	private normalizeEmail(value: string): string {
		const normalized = this.normalizeText(value).toLowerCase();

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
			throw new ServiceError(400, 'INVALID_EMAIL', 'Email is invalid');
		}

		return normalized;
	}

	private normalizePage(value?: number): number {
		if (typeof value !== 'number' || Number.isNaN(value) || value < 1) {
			return DEFAULT_PAGE;
		}

		return Math.floor(value);
	}

	private normalizeLimit(value?: number): number {
		if (typeof value !== 'number' || Number.isNaN(value) || value < 1) {
			return DEFAULT_LIMIT;
		}

		return Math.min(Math.floor(value), MAX_LIMIT);
	}

	private normalizeSearch(value?: string): string {
		return value?.trim().toLowerCase() ?? '';
	}
}

export const userService = new UserService();
