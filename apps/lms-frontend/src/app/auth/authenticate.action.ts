import { signIn } from "./auth";

export async function authenticate(data: {
  email: string;
  name: string;
  uuid: string;
}): Promise<any> {
  try {
    return await signIn("credentials", {
      redirect: false,
      email: data.email,
      name: data.name,
      uuid: data.uuid,
    });
  } catch (err) {
    return null;
  }
}
