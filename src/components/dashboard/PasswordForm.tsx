"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/DataDisplay";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";
import { changePasswordAction } from "@/lib/actions/account";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, {
    ok: false,
  });

  return (
    <form action={formAction} className="space-y-5">
      {state.ok && state.message && <Alert kind="success">{state.message}</Alert>}
      {!state.ok && state.error && <Alert kind="error">{state.error}</Alert>}

      <Input
        label="Current password"
        name="current_password"
        type="password"
        autoComplete="current-password"
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="New password"
          name="new_password"
          type="password"
          autoComplete="new-password"
          hint="Min. 8 characters, letters + numbers."
          required
        />
        <Input
          label="Confirm new password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          {pending ? "Updating..." : "Change password"}
        </Button>
      </div>
    </form>
  );
}
