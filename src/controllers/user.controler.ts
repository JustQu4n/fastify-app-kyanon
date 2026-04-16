import { FastifyReply, FastifyRequest } from 'fastify';

import { ListUsersQuery, UpdateUserPayload, CreateUserPayload } from '../models/user.model';
import { ServiceError, userService } from '../services/user.service';

type UserParams = {
	id: string;
};

type CreateUserRequest = {
	Body: CreateUserPayload;
};

type UpdateUserRequest = {
	Params: UserParams;
	Body: UpdateUserPayload;
};

type UserIdRequest = {
	Params: UserParams;
};

type ListUsersRequest = {
	Querystring: ListUsersQuery;
};

function handleServiceError(reply: FastifyReply, error: unknown): void {
	if (error instanceof ServiceError) {
		reply.status(error.statusCode).send({
			success: false,
			message: error.message,
			code: error.code,
		});

		return;
	}

	reply.status(500).send({
		success: false,
		message: 'Internal server error',
	});
}

export async function listUsers(request: FastifyRequest<ListUsersRequest>, reply: FastifyReply) {
	try {
		const result = userService.list(request.query);

		reply.send({
			success: true,
			data: result,
		});
	} catch (error) {
		handleServiceError(reply, error);
	}
}

export async function getUserById(request: FastifyRequest<UserIdRequest>, reply: FastifyReply) {
	try {
		const user = userService.getById(request.params.id);

		reply.send({
			success: true,
			data: user,
		});
	} catch (error) {
		handleServiceError(reply, error);
	}
}

export async function createUser(request: FastifyRequest<CreateUserRequest>, reply: FastifyReply) {
	try {
		const user = userService.create(request.body);

		reply.status(201).send({
			success: true,
			message: 'User created successfully',
			data: user,
		});
	} catch (error) {
		handleServiceError(reply, error);
	}
}

export async function updateUser(request: FastifyRequest<UpdateUserRequest>, reply: FastifyReply) {
	try {
		const user = userService.update(request.params.id, request.body);

		reply.send({
			success: true,
			message: 'User updated successfully',
			data: user,
		});
	} catch (error) {
		handleServiceError(reply, error);
	}
}

export async function deleteUser(request: FastifyRequest<UserIdRequest>, reply: FastifyReply) {
	try {
		userService.delete(request.params.id);

		reply.status(204).send();
	} catch (error) {
		handleServiceError(reply, error);
	}
}
