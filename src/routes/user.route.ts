import { FastifyPluginAsync } from 'fastify';

import {
	createUser,
	deleteUser,
	getUserById,
	listUsers,
	updateUser,
} from '../controllers/user.controler';

const userIdParamsSchema = {
	type: 'object',
	required: ['id'],
	properties: {
		id: { type: 'string', minLength: 1 },
	},
} as const;

const userRoleSchema = {
	type: 'string',
	enum: ['admin', 'manager', 'staff', 'viewer'],
} as const;

const createUserBodySchema = {
	type: 'object',
	required: ['fullName', 'email', 'role'],
	additionalProperties: false,
	properties: {
		fullName: { type: 'string', minLength: 1 },
		email: { type: 'string', minLength: 3 },
		phone: { type: 'string', minLength: 1 },
		role: userRoleSchema,
		isActive: { type: 'boolean' },
	},
} as const;

const updateUserBodySchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		fullName: { type: 'string', minLength: 1 },
		email: { type: 'string', minLength: 3 },
		phone: { type: 'string', minLength: 1 },
		role: userRoleSchema,
		isActive: { type: 'boolean' },
	},
} as const;

const listUsersQuerySchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		page: { type: 'integer', minimum: 1, default: 1 },
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
		search: { type: 'string' },
	},
} as const;

export const userRoutes: FastifyPluginAsync = async (app) => {
	app.get('/', {
		schema: {
			querystring: listUsersQuerySchema,
		},
	}, listUsers);

	app.get('/:id', {
		schema: {
			params: userIdParamsSchema,
		},
	}, getUserById);

	app.post('/', {
		schema: {
			body: createUserBodySchema,
		},
	}, createUser);

	app.put('/:id', {
		schema: {
			params: userIdParamsSchema,
			body: updateUserBodySchema,
		},
	}, updateUser);

	app.delete('/:id', {
		schema: {
			params: userIdParamsSchema,
		},
	}, deleteUser);
};
