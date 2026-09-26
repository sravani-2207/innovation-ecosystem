import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaxonomyPicker } from "@/components/TaxonomyPicker";
import { UdbhavaMark } from "@/components/UdbhavaLogo";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import {
  AVAILABILITY,
  DIFFICULTIES,
  INTERESTS,
  SKILLS,
  YEARS,
} from "@/lib/constants";
import { useMutation, useQuery } from "convex/react";
import {
  Building2,
  GraduationCap,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

type RoleChoice = "student" | "organization" | "admin";

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<RoleChoice | null>(null);
  const [saving, setSaving] = useState(false);
  const adminAvailable = useQuery(api.profiles.adminExists, {}) === false;

  const preselected = searchParams.get("role") as RoleChoice | null;
  const chosen: RoleChoice | null = role ?? preselected;

  return (
    <div className="hero-warm dark:hero-warm-dark flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <UdbhavaMark className="size-10" />
          <div>
            <p className="text-[15px] font-semibold lowercase tracking-[0.2em]">
              udbhava
            </p>
            <p className="text-xs text-muted-foreground">
              One step left — tell the workspace who you are
            </p>
          </div>
        </div>

        {!chosen ? (
          <Card className="soft-shadow border-border/80">
            <CardHeader>
              <CardTitle>Choose your role</CardTitle>
              <CardDescription>
                This decides your dashboard, your permissions and how udbhava
                works for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <RoleCard
                icon={<GraduationCap className="size-5" />}
                title="Student"
                body="Find challenges matched to your skills and work them to completion."
                selected={false}
                onClick={() => setRole("student")}
              />
              <RoleCard
                icon={<Building2 className="size-5" />}
                title="Organization"
                body="Publish problems, follow participation and review what comes back."
                selected={false}
                onClick={() => setRole("organization")}
              />
              {adminAvailable && (
                <RoleCard
                  icon={<ShieldCheck className="size-5" />}
                  title="Administrator"
                  body="Run the workspace: members, challenges and everything between."
                  selected={false}
                  onClick={() => setRole("admin")}
                />
              )}
            </CardContent>
          </Card>
        ) : chosen === "student" ? (
          <StudentForm
            defaultEmail={user?.email ?? ""}
            saving={saving}
            setSaving={setSaving}
            onDone={() => navigate("/dashboard")}
          />
        ) : chosen === "organization" ? (
          <OrgForm
            saving={saving}
            setSaving={setSaving}
            onDone={() => navigate("/dashboard")}
          />
        ) : (
          <AdminForm
            saving={saving}
            setSaving={setSaving}
            onDone={() => navigate("/admin")}
          />
        )}
      </div>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  body,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full flex-col items-start rounded-xl border p-5 text-left transition-all ${
        selected
          ? "border-primary bg-accent"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/40"
      }`}
    >
      <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
        {icon}
      </span>
      <span className="font-semibold">{title}</span>
      <span className="mt-1 text-sm leading-6 text-muted-foreground">{body}</span>
    </button>
  );
}

function StudentForm({
  defaultEmail,
  saving,
  setSaving,
  onDone,
}: {
  defaultEmail: string;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onDone: () => void;
}) {
  const save = useMutation(api.profiles.saveStudentProfile);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [availability, setAvailability] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !college.trim()) {
      toast.error("Name and college are required.");
      return;
    }
    setSaving(true);
    try {
      await save({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        college: college.trim(),
        department: department.trim() || undefined,
        course: course.trim() || undefined,
        year: year || undefined,
        location: location.trim() || undefined,
        skills,
        interests,
        experienceLevel: experienceLevel || undefined,
        availability: availability || undefined,
      });
      toast.success("Profile saved — welcome to udbhava.");
      onDone();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Card className="soft-shadow border-border/80">
        <CardHeader>
          <CardTitle>Student profile</CardTitle>
          <CardDescription>
            {defaultEmail && `Signed in as ${defaultEmail} · `}
            The workspace uses this to rank challenges and surface the right teammates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </Field>
            <Field label="Last name">
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </Field>
            <Field label="College / University">
              <Input value={college} onChange={(e) => setCollege(e.target.value)} required placeholder="e.g. RV College of Engineering" />
            </Field>
            <Field label="Department">
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" />
            </Field>
            <Field label="Course">
              <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. B.Tech" />
            </Field>
            <Field label="Year">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Location">
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" />
            </Field>
            <Field label="Experience level">
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Availability">
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Hours per week" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Skills" hint="Pick from the list or add your own — AI matching uses these.">
            <TaxonomyPicker
              options={SKILLS}
              selected={skills}
              onChange={setSkills}
              placeholder="Type or pick a skill…"
            />
          </Field>
          <Field label="Interests" hint="Domains you care about.">
            <TaxonomyPicker
              options={INTERESTS}
              selected={interests}
              onChange={setInterests}
              placeholder="Type or pick an interest…"
            />
          </Field>
        </CardContent>
      </Card>
      <div className="mt-5 flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save profile & continue
        </Button>
      </div>
    </form>
  );
}

function OrgForm({
  saving,
  setSaving,
  onDone,
}: {
  saving: boolean;
  setSaving: (v: boolean) => void;
  onDone: () => void;
}) {
  const save = useMutation(api.profiles.saveOrgProfile);
  const [orgName, setOrgName] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast.error("Organization name is required.");
      return;
    }
    setSaving(true);
    try {
      await save({
        orgName: orgName.trim(),
        orgWebsite: orgWebsite.trim() || undefined,
        about: about.trim() || undefined,
        location: location.trim() || undefined,
      });
      toast.success("Organization profile saved!");
      onDone();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Card className="soft-shadow border-border/80">
        <CardHeader>
          <CardTitle>Organization profile</CardTitle>
          <CardDescription>
            Students will see this name on every challenge you publish.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Organization name">
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} required placeholder="e.g. CleanCity Labs" />
          </Field>
          <Field label="Website">
            <Input value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Location">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" />
          </Field>
          <Field label="About">
            <Input value={about} onChange={(e) => setAbout(e.target.value)} placeholder="What does your organization do?" />
          </Field>
        </CardContent>
      </Card>
      <div className="mt-5 flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save profile & continue
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function AdminForm({
  saving,
  setSaving,
  onDone,
}: {
  saving: boolean;
  setSaving: (v: boolean) => void;
  onDone: () => void;
}) {
  const save = useMutation(api.profiles.saveAdminProfile);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please provide your full name.");
      return;
    }
    setSaving(true);
    try {
      await save({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      toast.success("Administrator profile created.");
      onDone();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Card className="soft-shadow border-border/80">
        <CardHeader>
          <CardTitle>Administrator profile</CardTitle>
          <CardDescription>
            You will manage members, challenges and workspace settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </Field>
            <Field label="Last name">
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </Field>
          </div>
        </CardContent>
      </Card>
      <div className="mt-5 flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Create admin profile
        </Button>
      </div>
    </form>
  );
}
