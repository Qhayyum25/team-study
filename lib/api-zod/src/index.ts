import * as Schemas from "./generated/api";
import * as Types from "./generated/types";

export * from "./generated/api";
export * from "./generated/types";

// Resolve collisions by merging value (Zod schema) and type
export const CreateGroupBody = Schemas.CreateGroupBody;
export type CreateGroupBody = Types.CreateGroupBody;

export const LoginBody = Schemas.LoginBody;
export type LoginBody = Types.LoginBody;

export const LoginResponse = Schemas.LoginResponse;
export type LoginResponse = Types.LoginResponse;

export const RegisterBody = Schemas.RegisterBody;
export type RegisterBody = Types.RegisterBody;

export const SendMessageBody = Schemas.SendMessageBody;
export type SendMessageBody = Types.SendMessageBody;

