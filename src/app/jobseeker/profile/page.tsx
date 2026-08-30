import { Card, CardBody, CardHeader } from "@/components/ui/DataDisplay";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { SkillsManager } from "@/components/dashboard/SkillsManager";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import type { Skill } from "@/types/database";

export const metadata = { title: "My Profile" };

export default async function JobseekerProfilePage() {
  const user = await requireRole("job_seeker");
  const supabase = await createClient();

  const { data: skillRows } = await supabase
    .from("user_skills")
    .select("skills ( id, name )")
    .eq("user_id", user.userId)
    .order("id", { referencedTable: "skills" });

  const mySkills: Skill[] = (skillRows ?? [])
    .map((r) => {
      const s = r as unknown as { skills: Skill | Skill[] | null };
      if (!s.skills) return null;
      return Array.isArray(s.skills) ? s.skills[0] : s.skills;
    })
    .filter((s): s is Skill => !!s);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Keep your information up to date — recruiters see this when you apply.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader title="Personal information" />
          <CardBody>
            <ProfileForm profile={user.profile} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Skills"
            description="Add skills so employers can find a match."
          />
          <CardBody>
            <SkillsManager mySkills={mySkills} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
