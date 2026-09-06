import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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
        update() {
          return Promise.resolve({ data: null, error: null });
        },
        delete() {
          return chain;
        },
        eq() {
          return chain;
        },
        neq() {
          return chain;
        },
        gt() {
          return chain;
        },
        gte() {
          return chain;
        },
        lt() {
          return chain;
        },
        lte() {
          return chain;
        },
        in() {
          return chain;
        },
        is() {
          return chain;
        },
        not() {
          return chain;
        },
        contains() {
          return chain;
        },
        ilike() {
          return chain;
        },
        order() {
          return chain;
        },
        limit() {
          return chain;
        },
        range() {
          return chain;
        },
        maybeSingle() {
          return Promise.resolve({ data: null, error: null });
        },
        single() {
          return Promise.resolve({ data: null, error: null });
        },
      };

      return chain;
    },
  } as const;
}

export async function createClient() {
  if (!hasSupabaseEnv()) {
    return createFallbackClient() as any;
  }

  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(
    url!,
    key!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
