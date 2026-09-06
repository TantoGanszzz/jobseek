import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, hasSupabaseEnv } from "./env";

function createFallbackClient() {
  return {
    auth: {
      async getUser() {
        return { data: { user: null }, error: null };
      },
      async signInWithPassword() {
        return {
          data: { user: null, session: null },
          error: { message: "Supabase belum dikonfigurasi." },
        };
      },
      async signUp() {
        return {
          data: { user: null, session: null },
          error: { message: "Supabase belum dikonfigurasi." },
        };
      },
      async signOut() {
        return { error: null };
      },
      async updateUser() {
        return { data: { user: null }, error: null };
      },
    },
    from() {
      const chain = {
        select() {
          return chain;
        },
        insert() {
          return Promise.resolve({ data: null, error: null });
        },
        upsert() {
          return Promise.resolve({ data: null, error: null });
        },
        delete() {
          return chain;
        },
        eq() {
          return chain;
        },
        single() {
          return Promise.resolve({ data: null, error: null });
        },
      };

      return chain;
    },
  } as const;
}

export function createClient() {
  if (!hasSupabaseEnv()) {
    return createFallbackClient() as any;
  }

  const { url, key } = getSupabaseEnv();

  return createBrowserClient(
    url!,
    key!
  );
}
