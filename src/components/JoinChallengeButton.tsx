import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

/** Join/leave button with confirmation; the gateway to the student loop. */
export function JoinChallengeButton({
  challengeId,
  joined,
  canJoin,
  reason,
}: {
  challengeId: Id<"challenges">;
  joined: boolean;
  canJoin: boolean;
  reason?: string;
}) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const join = useMutation(api.challenges.join);
  const leave = useMutation(api.challenges.leave);

  const handleJoin = async () => {
    setPending(true);
    try {
      await join({ id: challengeId });
      setConfirmOpen(false);
      toast.success("You joined this challenge!", {
        description: "Team formation and your workspace are unlocked.",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not join the challenge.",
      );
    } finally {
      setPending(false);
    }
  };

  const handleLeave = async () => {
    setPending(true);
    try {
      await leave({ id: challengeId });
      setLeaveOpen(false);
      toast("You left the challenge.", {
        description: "You can join again while it stays open.",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not leave the challenge.",
      );
    } finally {
      setPending(false);
    }
  };

  if (!canJoin && !joined) {
    return (
      <Button variant="outline" disabled title={reason}>
        Join Challenge
      </Button>
    );
  }

  if (joined) {
    return (
      <>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setLeaveOpen(true)}
          disabled={pending}
        >
          <LogOut className="size-4" />
          Leave challenge
        </Button>
        <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Leave this challenge?</DialogTitle>
              <DialogDescription>
                You can rejoin while participation is still open.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setLeaveOpen(false)}>
                Stay
              </Button>
              <Button variant="destructive" onClick={handleLeave} disabled={pending}>
                {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Leave challenge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button
        className="gap-2"
        onClick={() =>
          isAuthenticated ? setConfirmOpen(true) : navigate("/auth?mode=register")
        }
      >
        <LogIn className="size-4" />
        Join Challenge
      </Button>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join this challenge?</DialogTitle>
            <DialogDescription>
              Joining unlocks team formation, idea submission and the AI
              Innovation Mentor for this challenge.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Not now
            </Button>
            <Button onClick={handleJoin} disabled={pending}>
              {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Join Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
