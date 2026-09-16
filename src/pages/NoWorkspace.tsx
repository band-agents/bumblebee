/**
 * NoWorkspace — a signed-in account that belongs to no workspace.
 *
 * With admin-created logins this only happens when a membership was removed,
 * so there is nothing to set up: say so plainly and offer a way out.
 */

import { UserX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CoBrand } from "./AuthPage";
import { CLIENT } from "../lib/brand";

export default function NoWorkspace() {
  const { signOut } = useAuth();
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center px-5 py-10">
      <div className="mb-10"><CoBrand size={26} /></div>
      <div className="max-w-[380px] text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-brand-wash border border-border flex items-center justify-center">
          <UserX size={22} className="text-brand-ink" />
        </div>
        <h1 className="text-[1.6rem] leading-tight mb-2">This login has no workspace</h1>
        <p className="text-body text-muted-foreground leading-relaxed mb-6">
          Your account isn't linked to the {CLIENT.name} workspace any more. Ask your admin to add you back.
        </p>
        <button onClick={signOut} className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-body font-semibold">
          Sign out
        </button>
      </div>
    </div>
  );
}
