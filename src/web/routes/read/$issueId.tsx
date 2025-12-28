import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/read/$issueId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { issueId } = Route.useParams();

  return <div>Hello {issueId}!</div>;
}
