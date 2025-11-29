"use server";

// SAFE server action wrapper
export async function loginAdmin(email, password) {
  // Import Firebase Auth ONLY on client
  return {
    email,
    password,
  };
}
