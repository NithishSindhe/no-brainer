import { useEffect } from "react";
import { useMutation } from '@tanstack/react-query';
import { useUser } from "@clerk/nextjs";

const ensureUser = async (): Promise<void> => {
  const response = await fetch('/api/ensure-user', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to ensure user in the database.');
  }
};

const EnsureUserSync = () => {
  const { user:_, isSignedIn } = useUser();
  const { mutate } = useMutation({
    mutationFn: ensureUser,
    onError: (error) => {
      console.error("Error syncing user:", error);
    },
  });

  useEffect(() => {
    if (isSignedIn) {
      mutate();
    }
  }, [isSignedIn, mutate]);

  return null;
};

export default EnsureUserSync;
