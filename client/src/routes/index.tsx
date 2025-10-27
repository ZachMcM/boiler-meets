import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!context.currentUserData) {
      throw redirect({
        to: "/login",
      });
    } else {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: App,
});

function App() {
  return <></>;
}
